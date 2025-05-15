import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Client } from "../client/schemas/client.schema";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Client.name) private clientModel: Model<Client>
  ) {}

  // Créer une commande, stocke le dépôt du client
  async createOrder(userId: string, dto: CreateOrderDto) {
    const client = await this.clientModel.findById(userId);
    if (!client) throw new NotFoundException("Client not found");

    // LOG pour debug !
    console.log("client affectations:", client.affectations);

    const depotId = client.affectations?.[0]?.depot?.toString() || "";

    const order = new this.orderModel({
      clientId: client._id,
      nom_client: client.nom_client,
      telephone: client.contact?.telephone || "",
      depot: depotId, // <<<<<<<<<<< BIEN UTILISER depotId ICI ! <<<<<<<<<<<
      items: dto.items,
      total: dto.total,
    });

    return order.save();
  }

  // Filtrer les commandes pour ne prendre que celles des clients du même dépôt
  async findByDepot(depotId: string) {
    return this.orderModel.find({ depot: depotId }).sort({ createdAt: -1 });
  }
}

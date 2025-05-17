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

  async createOrder(userId: string, dto: CreateOrderDto) {
    const client = await this.clientModel.findById(userId);
    if (!client) throw new NotFoundException("Client not found");

    // Adresse
    const adresseClient = client.localisation?.adresse || "";
    const ville = client.localisation?.ville || "";
    const codePostal = client.localisation?.code_postal || "";
    const region = client.localisation?.region || "";

    // Ajout depot_name
    const depotId = client.affectations?.[0]?.depot?.toString() || "";
    let depot_name = "";
    if (
      client.affectations?.[0]?.depot &&
      this.clientModel.db.modelNames().includes("Depot")
    ) {
      const DepotModel = this.clientModel.db.model("Depot");
      const depotDoc = await DepotModel.findById(client.affectations[0].depot).lean();
      if (depotDoc && !Array.isArray(depotDoc) && typeof depotDoc.nom_depot === "string") {
        depot_name = depotDoc.nom_depot;
      }
    }

    // Numéro unique pour chaque commande
    const numero = "CMD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    const order = new this.orderModel({
      clientId: client._id,
      nom_client: client.nom_client,
      telephone: client.contact?.telephone || "",
      depot: depotId,
      depot_name, // Ajouté
      adresse_client: {
        adresse: adresseClient,
        ville,
        code_postal: codePostal,
        region,
      },
      items: dto.items,
      total: dto.total,
      numero, // Ajouté
    });

    return order.save();
  }

  // Filtrer les commandes pour ne prendre que celles des clients du même dépôt
  async findByDepot(depotId: string) {
    return this.orderModel.find({ depot: depotId }).sort({ createdAt: -1 });
  }
}

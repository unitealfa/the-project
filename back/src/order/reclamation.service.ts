import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Reclamation } from "./schemas/reclamation.schema";
import { Order } from "./schemas/order.schema";

@Injectable()
export class ReclamationService {
  constructor(
    @InjectModel(Reclamation.name) private reclamationModel: Model<Reclamation>,
    @InjectModel(Order.name) private orderModel: Model<Order>
  ) {}

  async createReclamation(clientId: string, orderId: string, titre: string, message: string) {
    const reclamation = new this.reclamationModel({
      clientId,
      orderId,
      titre,
      message,
      status: 'en_attente'
    });
    return reclamation.save();
  }

  async getReclamationsByOrder(orderId: string) {
    return this.reclamationModel.find({ orderId }).sort({ createdAt: -1 }).lean();
  }

  async getReclamationsByClient(clientId: string) {
    return this.reclamationModel.find({ clientId }).sort({ createdAt: -1 }).lean();
  }

  async getReclamationsByDepot(depotId: string) {
    // Récupérer d'abord toutes les commandes du dépôt
    const orders = await this.orderModel.find({ depot: depotId }).select('_id').lean();
    const orderIds = orders.map(order => order._id);
    
    // Récupérer toutes les réclamations liées à ces commandes
    return this.reclamationModel.find({ orderId: { $in: orderIds } })
      .sort({ createdAt: -1 })
      .lean();
  }

  async updateReclamationStatus(id: string, status: 'en_attente' | 'en_cours' | 'resolue', reponse?: string) {
    const update: any = { status };
    if (reponse) {
      update.reponse = reponse;
      update.reponseDate = new Date();
    }
    return this.reclamationModel.findByIdAndUpdate(id, update, { new: true });
  }
} 
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Client } from "../client/schemas/client.schema";
import { ProductService } from "../product/product.service";
import { Reclamation } from "./schemas/reclamation.schema";
import { Depot } from "../depot/schemas/depot.schema";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(Reclamation.name) private reclamationModel: Model<Reclamation>,
    @InjectModel(Depot.name) private depotModel: Model<Depot>,
    private productService: ProductService
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    const client = await this.clientModel.findById(userId);
    if (!client) throw new NotFoundException("Client not found");

    const adresseClient = client.localisation?.adresse || "";
    const ville = client.localisation?.ville || "";
    const codePostal = client.localisation?.code_postal || "";
    const region = client.localisation?.region || "";

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

    // Vérifier la disponibilité du stock pour chaque produit
    for (const item of dto.items) {
      const product = await this.productService.findOne(item.productId);
      if (!product) {
        throw new NotFoundException(`Produit ${item.productName} non trouvé`);
      }

      const depotDispo = product.disponibilite.find(d => d.depot_id.toString() === depotId);
      if (!depotDispo) {
        throw new BadRequestException(`Le produit ${item.productName} n'est pas disponible dans ce dépôt`);
      }

      if (depotDispo.quantite < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${item.productName}. Quantité disponible: ${depotDispo.quantite}, Quantité demandée: ${item.quantity}`
        );
      }
    }

    // Mettre à jour les quantités de stock pour chaque produit
    for (const item of dto.items) {
      const product = await this.productService.findOne(item.productId);
      const depotDispo = product.disponibilite.find(d => d.depot_id.toString() === depotId);
      const newQuantite = depotDispo.quantite - item.quantity;
      await this.productService.updateQuantiteParDepot(item.productId, depotId, newQuantite);
    }

    // Créer la commande avec le numéro directement
    const numero = "CMD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    const order = new this.orderModel({
      clientId: client._id,
      nom_client: client.nom_client,
      telephone: client.contact?.telephone || "",
      depot: depotId,
      depot_name,
      adresse_client: {
        adresse: adresseClient,
        ville,
        code_postal: codePostal,
        region,
      },
      items: dto.items,
      total: dto.total,
      confirmed: false,
      numero
    });

    return order.save();
  }

  async findById(id: string) {
    return this.orderModel.findById(id).lean();
  }

  async findByDepot(depotId: string) {
    // 1. Récupère les commandes
    const orders = await this.orderModel
      .find({ depot: depotId })
      .sort({ createdAt: -1 }) // Tri par date décroissante
      .lean();

    // 2. Récupère tous les clients nécessaires en une seule fois
    const clientIds = [...new Set(orders.map(o => o.clientId))];
    const clients = await this.clientModel.find({ _id: { $in: clientIds } }).lean();
    const clientMap = Object.fromEntries(clients.map(c => [c._id.toString(), c]));

    // 3. Ajoute les infos clients à chaque commande (latitude, longitude, nom, téléphone)
    return orders.map(order => {
      const client = clientMap[order.clientId?.toString()];
      const coord = client?.localisation?.coordonnees || { latitude: 0, longitude: 0 };
      return {
        ...order,
        client_latitude: coord.latitude,
        client_longitude: coord.longitude,
        client_nom: client?.nom_client || '',
        client_telephone: client?.contact?.telephone || '',
      };
    });
  }

  async findByClient(clientId: string) {
    return this.orderModel
      .find({ clientId })
      .sort({ createdAt: -1 }) // Tri par date décroissante
      .lean();
  }

  async confirmOrder(orderId: string) {
    const numero = "CMD-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    return this.orderModel.findByIdAndUpdate(
      orderId,
      { confirmed: true, numero },
      { new: true }
    );
  }

  async updateDeliveryStatus(orderId: string, status: 'en_attente' | 'en_cours' | 'livree') {
    return this.orderModel.findByIdAndUpdate(
      orderId,
      { etat_livraison: status },
      { new: true }
    );
  }

  async addDeliveryPhotos(
    orderId: string,
    photos: Array<{ url: string; takenAt: Date }>
  ) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException(`Commande ${orderId} introuvable`);
    order.photosLivraison.push(...photos);
    if (order.photosLivraison.length > 4) {
      order.photosLivraison = order.photosLivraison.slice(-4);
    }
    return order.save();
  }

  async deleteDeliveryPhoto(orderId: string, photoIdx: number) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Commande non trouvée');
    if (!order.photosLivraison || order.photosLivraison.length <= photoIdx) {
      throw new NotFoundException('Photo non trouvée');
    }
    // Optionnel : supprimer le fichier physique ici
    order.photosLivraison.splice(photoIdx, 1);
    await order.save();
    return order;
  }

  async getOrderStats(depotId: string, period: 'day' | 'week' | 'month' | 'all') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all':
        startDate = new Date(0); // 1er janvier 1970
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const orders = await this.orderModel.find({
      depot: depotId,
      createdAt: { $gte: startDate }
    });

    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
    const ordersInDelivery = orders.filter(order => order.etat_livraison === 'en_cours').length;
    const ordersDelivered = orders.filter(order => order.etat_livraison === 'livree').length;

    // Récupérer les IDs des commandes pour les réclamations
    const orderIds = orders.map(order => order._id);

    // Statistiques des réclamations
    const reclamations = await this.reclamationModel.find({
      orderId: { $in: orderIds }
    });

    const totalReclamations = reclamations.length;
    const reclamationsEnAttente = reclamations.filter(r => r.status === 'en_attente').length;
    const reclamationsRejetees = reclamations.filter(r => r.status === 'rejeter').length;
    const reclamationsResolues = reclamations.filter(r => r.status === 'resolue').length;

    // Top 5 clients les plus fidèles
    const clientOrders = await this.orderModel.aggregate([
      { $match: { 
        depot: depotId,
        createdAt: { $gte: startDate }
      }},
      { $group: { _id: '$clientId', count: { $sum: 1 }, total: { $sum: '$total' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topClients = await Promise.all(
      clientOrders.map(async (client) => {
        const clientInfo = await this.clientModel.findById(client._id);
        const depotId = clientInfo?.affectations?.[0]?.depot;
        let depotName = "Non assigné";
        
        if (depotId) {
          const depotDoc = await this.depotModel.findById(depotId).lean();
          if (depotDoc && typeof depotDoc.nom_depot === "string") {
            depotName = depotDoc.nom_depot;
          }
        }

        return {
          clientId: client._id,
          nom: clientInfo?.nom_client || 'Client inconnu',
          prenom: '',
          nombreCommandes: client.count,
          montantTotal: client.total,
          depotName
        };
      })
    );

    // Top produits commandés
    const productStats = await this.orderModel.aggregate([
      { $match: { 
        depot: depotId,
        createdAt: { $gte: startDate }
      }},
      { $unwind: '$items' },
      { $group: {
          _id: '$items.productId',
          nom: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalAmount: { $sum: { $multiply: ['$items.prix_detail', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    return {
      totalOrders,
      totalAmount,
      ordersInDelivery,
      ordersDelivered,
      totalReclamations,
      reclamationsEnAttente,
      reclamationsRejetees,
      reclamationsResolues,
      topClients,
      topProducts: productStats
    };
  }

  async getGlobalStats(period: 'day' | 'week' | 'month' | 'all') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'all':
        startDate = new Date(0); // 1er janvier 1970
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    // Statistiques globales
    const orders = await this.orderModel.find({
      createdAt: { $gte: startDate }
    });

    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
    const ordersInDelivery = orders.filter(order => order.etat_livraison === 'en_cours').length;
    const ordersDelivered = orders.filter(order => order.etat_livraison === 'livree').length;

    // Statistiques des réclamations
    const reclamations = await this.reclamationModel.find({
      createdAt: { $gte: startDate }
    });

    const totalReclamations = reclamations.length;
    const reclamationsEnAttente = reclamations.filter(r => r.status === 'en_attente').length;
    const reclamationsRejetees = reclamations.filter(r => r.status === 'rejeter').length;
    const reclamationsResolues = reclamations.filter(r => r.status === 'resolue').length;

    // Top 5 clients les plus fidèles (tous dépôts confondus)
    const clientOrders = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$clientId', count: { $sum: 1 }, total: { $sum: '$total' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topClients = await Promise.all(
      clientOrders.map(async (client) => {
        const clientInfo = await this.clientModel.findById(client._id);
        const depotId = clientInfo?.affectations?.[0]?.depot;
        let depotName = "Non assigné";
        
        if (depotId) {
          const depotDoc = await this.depotModel.findById(depotId).lean();
          if (depotDoc && typeof depotDoc.nom_depot === "string") {
            depotName = depotDoc.nom_depot;
          }
        }

        return {
          clientId: client._id,
          nom: clientInfo?.nom_client || 'Client inconnu',
          prenom: '',
          nombreCommandes: client.count,
          montantTotal: client.total,
          depotName
        };
      })
    );

    // Statistiques par dépôt
    const depotStats = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
          _id: '$depot',
          depot_name: { $first: '$depot_name' },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          ordersInDelivery: {
            $sum: { $cond: [{ $eq: ['$etat_livraison', 'en_cours'] }, 1, 0] }
          },
          ordersDelivered: {
            $sum: { $cond: [{ $eq: ['$etat_livraison', 'livree'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Top produits les plus vendus (tous dépôts confondus)
    const productStats = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.productId',
          nom: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalAmount: { $sum: { $multiply: ['$items.prix_detail', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    return {
      totalOrders,
      totalAmount,
      ordersInDelivery,
      ordersDelivered,
      totalReclamations,
      reclamationsEnAttente,
      reclamationsRejetees,
      reclamationsResolues,
      topClients,
      depotStats,
      topProducts: productStats
    };
  }
}

// back/src/order/order.service.ts

import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Client } from "../client/schemas/client.schema";
import { ProductService } from "../product/product.service";
import { Reclamation } from "./schemas/reclamation.schema";
import { Depot } from "../depot/schemas/depot.schema";
import { LoyaltyService } from '../loyalty/loyalty.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(Reclamation.name) private reclamationModel: Model<Reclamation>,
    @InjectModel(Depot.name) private depotModel: Model<Depot>,
    private productService: ProductService,
    private loyaltyService: LoyaltyService,
  ) {}

  async createOrder(userId: string, dto: CreateOrderDto): Promise<Order[]> {
    const client = await this.clientModel.findById(userId);
    if (!client) throw new NotFoundException("Client not found");

    const adresseClient = client.localisation?.adresse || "";
    const ville = client.localisation?.ville || "";
    const codePostal = client.localisation?.code_postal || "";
    const region = client.localisation?.region || "";

    // Récupère la liste des dépôts assignés au client
    const clientDepots = (client.affectations ?? []).map(a => a.depot.toString());
    if (clientDepots.length === 0) {
      throw new BadRequestException("Aucun dépôt associé au client");
    }

    // Pour chaque dépôt, on stocke le tableau d'items à passer
    const itemsByDepot: Record<string, CreateOrderDto["items"]> = {};

    for (const item of dto.items) {
      const product = await this.productService.findOne(item.productId);
      if (!product) {
        throw new NotFoundException(`Produit ${item.productName} non trouvé`);
      }

      // Cherche la disponibilité du produit dans l'un des dépôts du client
      const dispo = product.disponibilite.find(d =>
        clientDepots.includes(d.depot_id.toString()),
      );

      if (!dispo) {
        throw new BadRequestException(
          `Le produit ${item.productName} n'est pas disponible dans vos dépôts`,
        );
      }
      if (dispo.quantite <= 0) {
        throw new BadRequestException(
          `Le produit ${item.productName} est en rupture de stock`,
        );
      }
      if (dispo.quantite < item.quantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${item.productName}. Quantité disponible : ${dispo.quantite}`,
        );
      }

      const key = dispo.depot_id.toString();
      if (!itemsByDepot[key]) {
        itemsByDepot[key] = [];
      }
      itemsByDepot[key].push(item);
    }

    const orders: Order[] = [];

    // Pour chaque dépôt concerné, on crée une commande séparée
    for (const [depotId, items] of Object.entries(itemsByDepot)) {
      // On utilise depotModel injecté pour que TypeScript sache que c'est un Depot
      const depotDoc = await this.depotModel.findById(depotId).lean<Depot>();
      const depot_name = depotDoc?.nom_depot || "";

      // Vérification & mise à jour du stock pour ce dépôt
      for (const item of items) {
        const product = await this.productService.findOne(item.productId);
        const depotDispo = product.disponibilite.find(
          d => d.depot_id.toString() === depotId,
        );
        if (!depotDispo || depotDispo.quantite <= 0) {
          throw new BadRequestException(
            `Le produit ${item.productName} est en rupture de stock`,
          );
        }
        if (depotDispo.quantite < item.quantity) {
          throw new BadRequestException(
            `Stock insuffisant pour ${item.productName}. Quantité disponible : ${depotDispo.quantite}`,
          );
        }
        const newQuantite = depotDispo.quantite - item.quantity;
        await this.productService.updateQuantiteParDepot(
          item.productId,
          depotId,
          newQuantite
        );
      }

      const totalDepot = items.reduce(
        (sum, it) => sum + it.prix_detail * it.quantity,
        0
      );
      const numero = "ALFA-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

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
        items,
        total: totalDepot,
        confirmed: false,
        numero,
      });

      orders.push(await order.save());
    }

    return orders;
  }

  async findById(id: string) {
    return this.orderModel.findById(id).lean<Order>();
  }

  async findByDepot(depotId: string, confirmed?: boolean) {
    // 1. On récupère toutes les commandes du dépôt (optionnellement filtrées sur le statut), triées par date
    const query: any = { depot: depotId };
    if (typeof confirmed === 'boolean') {
      query.confirmed = confirmed;
    }
    const orders = await this.orderModel
      .find(query)
      .sort({ createdAt: -1 })
      .lean<Order[]>(); // <-- bien préciser Order[] pour que TS sache que c'est un tableau

    // 2. On récupère en une seule fois tous les clients référencés
    const clientIds = [...new Set(orders.map(o => o.clientId.toString()))];
    const clients = await this.clientModel
      .find({ _id: { $in: clientIds } })
      .lean<Client[]>(); // <-- idem Client[]
    const clientMap = Object.fromEntries(
      clients.map(c => [c._id.toString(), c])
    );

    // 3. On enrichit chaque commande avec son nom_depot + infos client
    return orders.map(order => {
      const client = clientMap[order.clientId.toString()];
      const coord = client?.localisation?.coordonnees || {
        latitude: 0,
        longitude: 0,
      };

      return {
        ...order,
        nom_depot: order.depot_name || "Unknown Depot",
        client_latitude: coord.latitude,
        client_longitude: coord.longitude,
        client_nom: client?.nom_client || "",
        client_telephone: client?.contact?.telephone || "",
      };
    });
  }

  async findByClient(clientId: string) {
    return this.orderModel
      .find({ clientId })
      .sort({ createdAt: -1 })
      .lean<Order[]>(); 
  }

  async confirmOrder(orderId: string) {
    const numero = "ALFA-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    return this.orderModel.findByIdAndUpdate(
      orderId,
      { confirmed: true, numero },
      { new: true }
    );
  }

  async updateDeliveryStatus(
    orderId: string,
    status: "en_attente" | "en_cours" | "livree" | "non_livree"
  ) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException("Commande non trouvée");
    const prev = order.etat_livraison;
    order.etat_livraison = status;
    await order.save();

    if (status === "livree" && prev !== "livree") {
      const depot = await this.depotModel.findById(order.depot).lean<Depot>();
      const companyId = depot?.company_id?.toString();
      if (companyId) {
        const pts = await this.loyaltyService.recordTierPoints(
          companyId,
          order.clientId,
          order.total
        );
        if (pts > 0) {
          await this.clientModel.findByIdAndUpdate(order.clientId, {
            $inc: { [`fidelite_points.${companyId}`]: pts },
          });
          await this.loyaltyService.recordRepeatPoints(companyId, order.clientId, pts);
        }
        
        await this.loyaltyService.recordSpend(companyId, order.clientId, order.total);
      }
    }

    return order;
  }

    async markAsNonDelivered(orderId: string, reason: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException("Commande non trouvée");
    order.etat_livraison = "non_livree";
    order.nonLivraisonCause = reason;
    await order.save();
    return order;
  }

  async confirmReturn(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException("Commande non trouvée");
    order.etat_livraison = "en_attente";
    order.nonLivraisonCause = undefined;
    await order.save();
    return order;
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
    if (!order) throw new NotFoundException("Commande non trouvée");
    if (!order.photosLivraison || order.photosLivraison.length <= photoIdx) {
      throw new NotFoundException("Photo non trouvée");
    }
    order.photosLivraison.splice(photoIdx, 1);
    await order.save();
    return order;
  }

  async getOrderStats(depotId: string, period: "day" | "week" | "month" | "all") {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "all":
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const orders = await this.orderModel.find({
      depot: depotId,
      createdAt: { $gte: startDate },
    });

    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
    const ordersInDelivery = orders.filter(
      order => order.etat_livraison === "en_cours"
    ).length;
    const ordersDelivered = orders.filter(
      order => order.etat_livraison === "livree"
    ).length;

    // IDs des commandes pour récupérer leurs réclamations
    const orderIds = orders.map(order => order._id);

    const reclamations = await this.reclamationModel.find({
      orderId: { $in: orderIds },
    });

    const totalReclamations = reclamations.length;
    const reclamationsEnAttente = reclamations.filter(
      r => r.status === "en_attente"
    ).length;
    const reclamationsRejetees = reclamations.filter(
      r => r.status === "rejeter"
    ).length;
    const reclamationsResolues = reclamations.filter(
      r => r.status === "resolue"
    ).length;

    // Top 5 clients les plus fidèles pour ce dépôt
    const clientOrders = await this.orderModel.aggregate([
      {
        $match: {
          depot: depotId,
          createdAt: { $gte: startDate },
        },
      },
      { $group: { _id: "$clientId", count: { $sum: 1 }, total: { $sum: "$total" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const topClients = await Promise.all(
      clientOrders.map(async clientAgg => {
        const clientInfo = await this.clientModel.findById(clientAgg._id);
        const firstDepotId = clientInfo?.affectations?.[0]?.depot;
        let depotName = "Non assigné";

        if (firstDepotId) {
          const depotDoc = await this.depotModel.findById(firstDepotId).lean<Depot>();
          if (depotDoc && typeof depotDoc.nom_depot === "string") {
            depotName = depotDoc.nom_depot;
          }
        }

        return {
          clientId: clientAgg._id,
          nom: clientInfo?.nom_client || "Client inconnu",
          prenom: "",
          nombreCommandes: clientAgg.count,
          montantTotal: clientAgg.total,
          depotName,
        };
      })
    );

    // Top produits commandés pour ce dépôt
    const productStats = await this.orderModel.aggregate([
      { $match: { depot: depotId, createdAt: { $gte: startDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          nom: { $first: "$items.productName" },
          totalQuantity: { $sum: "$items.quantity" },
          totalAmount: {
            $sum: { $multiply: ["$items.prix_detail", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
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
      topProducts: productStats,
    };
  }

  async getGlobalStats(period: "day" | "week" | "month" | "all") {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "all":
        startDate = new Date(0);
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    // Toutes les commandes depuis startDate
    const orders = await this.orderModel.find({
      createdAt: { $gte: startDate },
    });

    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
    const ordersInDelivery = orders.filter(
      order => order.etat_livraison === "en_cours"
    ).length;
    const ordersDelivered = orders.filter(
      order => order.etat_livraison === "livree"
    ).length;

    const reclamations = await this.reclamationModel.find({
      createdAt: { $gte: startDate },
    });

    const totalReclamations = reclamations.length;
    const reclamationsEnAttente = reclamations.filter(
      r => r.status === "en_attente"
    ).length;
    const reclamationsRejetees = reclamations.filter(
      r => r.status === "rejeter"
    ).length;
    const reclamationsResolues = reclamations.filter(
      r => r.status === "resolue"
    ).length;

    // Top 5 clients tous dépôts confondus
    const clientOrders = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$clientId", count: { $sum: 1 }, total: { $sum: "$total" } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    const topClients = await Promise.all(
      clientOrders.map(async clientAgg => {
        const clientInfo = await this.clientModel.findById(clientAgg._id);
        const firstDepotId = clientInfo?.affectations?.[0]?.depot;
        let depotName = "Non assigné";

        if (firstDepotId) {
          const depotDoc = await this.depotModel.findById(firstDepotId).lean<Depot>();
          if (depotDoc && typeof depotDoc.nom_depot === "string") {
            depotName = depotDoc.nom_depot;
          }
        }

        return {
          clientId: clientAgg._id,
          nom: clientInfo?.nom_client || "Client inconnu",
          prenom: "",
          nombreCommandes: clientAgg.count,
          montantTotal: clientAgg.total,
          depotName,
        };
      })
    );

    // Statistiques par dépôt
    const depotStats = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$depot",
          depot_name: { $first: "$depot_name" },
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$total" },
          ordersInDelivery: {
            $sum: { $cond: [{ $eq: ["$etat_livraison", "en_cours"] }, 1, 0] },
          },
          ordersDelivered: {
            $sum: { $cond: [{ $eq: ["$etat_livraison", "livree"] }, 1, 0] },
          },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    // Top produits tous dépôts
    const productStats = await this.orderModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          nom: { $first: "$items.productName" },
          totalQuantity: { $sum: "$items.quantity" },
          totalAmount: {
            $sum: { $multiply: ["$items.prix_detail", "$items.quantity"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
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
      topProducts: productStats,
    };
  }
}

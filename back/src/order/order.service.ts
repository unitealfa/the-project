import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Order } from "./schemas/order.schema";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Client } from "../client/schemas/client.schema";
import { ProductService } from "../product/product.service";

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
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
}

// src/tournee/tournee.service.ts

import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import axios from "axios";

import { Depot } from "../depot/schemas/depot.schema";
import { Client } from "../client/schemas/client.schema";
import { Vehicle } from "../vehicle/schemas/vehicle.schema";
import { Tournee } from "./schemas/tournee.schema";
import { vrpConfig } from "../config/vrp.config";
import { Order as OrderSchema } from "../order/schemas/order.schema";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  prix_detail: number;
}

interface OrderWithClient extends OrderSchema {
  clientId: string;
  items: OrderItem[];
}

interface Stop {
  stop_id: string;
  orders: OrderWithClient[];
  products: OrderItem[];
  client_name?: string;
}

interface VehicleSolution {
  ordered_stops: Stop[];
  products_summary?: {
    productId: string;
    productName: string;
    quantity: number;
    prix_detail: number;
  }[];
    make?: string;
  model?: string;
  license_plate?: string;
  chauffeur?: { nom: string; prenom: string } | null;
  livreur?: { nom: string; prenom: string } | null;
}

interface TourneeSolution {
  date1: Record<string, VehicleSolution>;
}

interface StopClient {
  _id: string;
  clientName: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class TourneeService {
  private readonly logger = new Logger(TourneeService.name);

  constructor(
    @InjectModel(Depot.name) private depotModel: Model<Depot>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    @InjectModel(Tournee.name) private tourneeModel: Model<Tournee>,
    @InjectModel(OrderSchema.name) private orderModel: Model<OrderSchema>
  ) {}

  /**
   * Appelle l'API VRP avec le payload fourni, sauvegarde la réponse en BDD,
   * et renvoie la réponse brute.
   */
  async proxyToVrpAndSave(depotId: string, payload: any) {
    try {
      this.logger.debug(`Proxy VRP pour dépôt ${depotId}`);

      if (!vrpConfig.url) {
        this.logger.error("VRP API URL non configurée");
        throw new Error("VRP API URL non configurée");
      }

      // 1) Appel à l'API VRP
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (vrpConfig.apiKey) {
        headers["x-api-key"] = vrpConfig.apiKey;
      }

      this.logger.debug(`Envoi payload VRP: ${JSON.stringify(payload)}`);
      const { data } = await axios.post(vrpConfig.url, payload, { headers });
      this.logger.debug("Réponse API VRP reçue");

      // Extraire les IDs des stops de la solution
      const stopIds = new Set();
      Object.values(data.solution.date1).forEach((vehicle: any) => {
        if (vehicle.ordered_stops) {
          vehicle.ordered_stops.forEach((stop: any) => {
            if (!stop.stop_id.startsWith('end_')) {
              stopIds.add(stop.stop_id);
            }
          });
        }
      });

      this.logger.debug('Stops trouvés dans la solution:', {
        stopIds: Array.from(stopIds)
      });

       // Récupérer uniquement les commandes des clients de ce dépôt qui sont dans la solution
      const orders = await this.orderModel.find({
        clientId: { $in: Array.from(stopIds) },
        depot: depotId,
        confirmed: false
      }).lean();

      this.logger.debug('Commandes trouvées pour la solution:', {
        count: orders.length,
        orderIds: orders.map(o => o._id),
        clients: orders.map(o => o.clientId)
      });

      // Confirmer ces commandes
      if (orders.length > 0) {
        await this.orderModel.updateMany(
          { _id: { $in: orders.map(o => o._id) } },
          { 
            $set: { 
              confirmed: true,
              etat_livraison: 'en_cours'
            } 
          }
        );
      }

      // 2) Sauvegarde en base
      const tournee = await this.tourneeModel.create({
        depot: depotId,
        date: new Date(),
        stops: Array.from(stopIds), // Utiliser uniquement les stops de la solution
        vehicles: payload.fleet.map((f: any) => f.id),
        orderIds: orders.map(o => o._id.toString()), // Ne garder que les commandes de la solution
        solution: data.solution,
        unscheduled: data.unscheduled,
        total_travel_time: data.total_travel_time,
        total_travel_distance: data.total_travel_distance,
        raw_response: data,
      });

      this.logger.log("Tournée enregistrée avec succès:", {
        tourneeId: tournee._id,
        orderCount: orders.length,
        orderIds: orders.map(o => o._id)
      });

      return data;
    } catch (error) {
      this.logger.error('Erreur lors de la planification de la tournée:', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Récupère toutes les tournées d'un dépôt
   */
  async findByDepot(depotId: string) {
    this.logger.debug(`Récupération des tournées pour le dépôt ${depotId}`);
    return this.tourneeModel
      .find({ depot: depotId })
      .sort({ date: -1 }) // Tri par date décroissante
      .lean();
  }

  /**
   * Récupère une tournée par son ID avec les détails des commandes
   */
  async findById(id: string) {
    this.logger.debug(`Récupération de la tournée ${id}`);
    const tournee = await this.tourneeModel.findById(id).lean();
    if (!tournee) return null;

    this.logger.debug('Tournée trouvée:', {
      id: tournee._id,
      stops: tournee.stops,
      orderIds: tournee.orderIds,
      date: tournee.date
    });

    // Récupérer uniquement les commandes qui sont dans la tournée
    const orders = await this.orderModel.find({
      _id: { $in: tournee.orderIds }
    }).lean() as OrderWithClient[];

        // Charger les détails des véhicules utilisés dans la tournée
    const vehicleDocs = await this.vehicleModel
      .find({ _id: { $in: tournee.vehicles } })
      .populate('chauffeur_id', 'nom prenom')
      .populate('livreur_id', 'nom prenom')
      .lean();
    const vehicleMap = vehicleDocs.reduce((acc, v) => {
      acc[v._id.toString()] = v;
      return acc;
    }, {} as Record<string, any>);

    this.logger.debug('Commandes trouvées pour la tournée:', {
      count: orders.length,
      orderIds: orders.map(o => o._id),
      clients: orders.map(o => o.clientId),
      details: orders.map(o => ({
        orderId: o._id,
        clientId: o.clientId,
        items: o.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity
        }))
      }))
    });

    // Organiser les commandes par client
    const ordersByClient = orders.reduce((acc, order) => {
      if (!acc[order.clientId]) {
        acc[order.clientId] = [];
      }
      acc[order.clientId].push(order);
      return acc;
    }, {} as Record<string, OrderWithClient[]>);

          // Ajouter les commandes à la solution
    if (tournee.solution) {
      const solution = tournee.solution as TourneeSolution;
      if (solution.date1) {
        Object.keys(solution.date1).forEach(vehicleId => {
          const vehicle = solution.date1[vehicleId];

          // Enrich vehicle information from the database
          const vehInfo = vehicleMap[vehicleId];
          if (vehInfo) {
            vehicle.make = vehInfo.make;
            vehicle.model = vehInfo.model;
            vehicle.license_plate = vehInfo.license_plate;
            vehicle.chauffeur = vehInfo.chauffeur_id
              ? { nom: vehInfo.chauffeur_id.nom, prenom: vehInfo.chauffeur_id.prenom }
              : null;
            vehicle.livreur = vehInfo.livreur_id
              ? { nom: vehInfo.livreur_id.nom, prenom: vehInfo.livreur_id.prenom }
              : null;
          }

          // Adapt ordered_stops and products_summary
          vehicle.ordered_stops = vehicle.ordered_stops.map(stop => {
            if (stop.stop_id.startsWith('end_')) return stop;

            // Ne prendre que les commandes qui sont dans orderIds
            const clientOrders = (ordersByClient[stop.stop_id] || [])
              .filter(order => tournee.orderIds.includes(order._id.toString()));

            const products = clientOrders.flatMap(order => order.items);
            
            this.logger.debug(`Arrêt ${stop.stop_id}:`, {
              ordersCount: clientOrders.length,
              productsCount: products.length,
              orderIds: clientOrders.map(o => o._id),
              products: products.map(p => ({
                name: p.productName,
                quantity: p.quantity
              }))
            });
            const clientName = clientOrders[0]?.nom_client || '';

            return {
              ...stop,
              orders: clientOrders,
              products: products,
              client_name: clientName
            };
          });

          // Calculer le total des produits pour ce véhicule
          const allProducts = vehicle.ordered_stops
            .filter(stop => !stop.stop_id.startsWith('end_'))
            .flatMap(stop => stop.products);

          // Regrouper les produits par type pour ce véhicule
          const productsByType = allProducts.reduce((acc, product) => {
            const key = product.productId;
            if (!acc[key]) {
              acc[key] = {
                productId: product.productId,
                productName: product.productName,
                quantity: 0,
                prix_detail: product.prix_detail
              };
            }
            acc[key].quantity += product.quantity;
            return acc;
          }, {} as Record<string, { productId: string; productName: string; quantity: number; prix_detail: number }>);

          // Ajouter le résumé des produits au véhicule
          vehicle.products_summary = Object.values(productsByType);

          this.logger.debug(`Résumé des produits pour le véhicule ${vehicleId}:`, {
            products: vehicle.products_summary.map(p => ({
              name: p.productName,
              quantity: p.quantity,
              prix: p.prix_detail
            }))
          });
        });
      }
    }

    return tournee;
  }

  /**
   * Met à jour le statut de chargement d'une tournée
   */
  async updateLoadingStatus(id: string, status: 'en_cours' | 'charge') {
    this.logger.debug(`Mise à jour du statut de chargement de la tournée ${id} à ${status}`);
    const tournee = await this.tourneeModel.findByIdAndUpdate(
      id,
      { $set: { statut_chargement: status } },
      { new: true }
    ).lean();

    if (tournee) {
      // Mettre à jour le statut de chargement des commandes associées
      await this.orderModel.updateMany(
        { _id: { $in: tournee.orderIds } },
        { $set: { statut_chargement: status } }
      );

      // Récupérer la tournée complète avec tous ses détails
      return this.findById(id);
    }

    return tournee;
  }

  async getStopsForChauffeur(chauffeurId: string): Promise<{
    depot: { latitude: number; longitude: number; nom_depot: string };
    stops: StopClient[];
  }> {
    // 1) Récupérer les véhicules rattachés à ce chauffeur
    const vehicles = await this.vehicleModel.find({ chauffeur_id: chauffeurId }).lean();
    const vehicleIds = vehicles.map(v => v._id.toString());
    if (!vehicleIds.length) {
      throw new NotFoundException(`Aucun véhicule trouvé pour le chauffeur ${chauffeurId}`);
    }

    // 2) Récupérer la dernière tournée affectant l'un de ces véhicules
    const tournee = await this.tourneeModel
      .findOne({ vehicles: { $in: vehicleIds } })
      .sort({ date: -1 })
      .lean();
    if (!tournee) {
      throw new NotFoundException(`Aucune tournée trouvée pour le chauffeur ${chauffeurId}`);
    }

    // 3) Charger les coordonnées du dépôt pour départ et retour
    const depotDoc = await this.depotModel.findById(tournee.depot).lean();
    if (!depotDoc || !depotDoc.coordonnees) {
      throw new NotFoundException(`Dépôt ${tournee.depot} introuvable ou sans coordonnées`);
    }
    const depotCoordinates = {
      latitude: depotDoc.coordonnees.latitude,
      longitude: depotDoc.coordonnees.longitude,
      nom_depot: depotDoc.nom_depot,
    };

    // 4) Extraire tous les clientIds (stop_id) de la solution VRP
    const solution: any = tournee.solution; // votre structure VRP
    const clientIds = new Set<string>();
    for (const vid of vehicleIds) {
      const veh = solution.date1?.[vid];
      if (veh?.ordered_stops) {
        veh.ordered_stops.forEach((stop: any) => {
          if (!stop.stop_id.startsWith("end_")) {
            clientIds.add(stop.stop_id);
          }
        });
      }
    }
    // Si aucun client à livrer, retourner juste le dépôt
    if (!clientIds.size) {
      return { depot: depotCoordinates, stops: [] };
    }

    // 5) Charger les documents Client pour récupérer nom + coordonnées
    const clients = await this.clientModel
      .find({ _id: { $in: Array.from(clientIds) } })
      .lean();

    // 6) Construire l'array stops au format attendu (StopClient[])
    const stops: StopClient[] = clients.map(c => {
      // Si c.localisation.coordonnees est manquant, on met (0,0) par défaut
      const coord = c.localisation?.coordonnees || { latitude: 0, longitude: 0 };
      return {
        _id: c._id.toString(),
        clientName: c.nom_client,
        latitude: coord.latitude,
        longitude: coord.longitude,
      };
    });

    return {
      depot: depotCoordinates,
      stops,
    };
  }

  async getOrdersForLivreur(livreurId: string): Promise<any[]> {
    this.logger.debug('▶ getOrdersForLivreur demarré pour', livreurId);

    // 1) Récupère les véhicules du livreur
    const vehicles = await this.vehicleModel.find({ livreur_id: livreurId }).lean();
    const vehicleIds = vehicles.map(v => v._id.toString());
    this.logger.debug('  véhicules trouvés:', vehicleIds);
    if (!vehicleIds.length) return [];

    // 2) Récupère la dernière tournée qui contient ces véhicules
    const tournee = await this.tourneeModel
      .findOne({ vehicles: { $in: vehicleIds } })
      .sort({ date: -1 })
      .lean();
    this.logger.debug('  tournée trouvée, orderIds =', tournee?.orderIds);
    if (!tournee) return [];

    // 3) Récupère les stops associés au véhicule du livreur
    const solution = tournee.solution as any;
    const clientIds = new Set<string>();

    // Pour chaque véhicule du livreur, récupère les stops qui lui sont assignés
    for (const vehicleId of vehicleIds) {
      const vehicleSolution = solution.date1?.[vehicleId];
      if (vehicleSolution?.ordered_stops) {
        vehicleSolution.ordered_stops.forEach((stop: any) => {
          if (!stop.stop_id.startsWith('end_')) {
            clientIds.add(stop.stop_id);
          }
        });
      }
    }

    // 4) Récupère les commandes pour ces clients qui sont dans la tournée
    const orders = await this.orderModel
      .find({
        clientId: { $in: Array.from(clientIds) },
        _id: { $in: tournee.orderIds }
      })
      .lean();

    this.logger.debug('  orders from DB:', orders);

    // 5) Formate la réponse
    return orders.map(o => ({
      _id: o._id.toString(),
      nom_client: o.nom_client,
      numero: o.numero,
      items: o.items,
      etat_livraison: o.etat_livraison || 'en_attente'
    }));
  }
}

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

@Injectable()
export class TourneeService {
  private readonly logger = new Logger(TourneeService.name);

  constructor(
    @InjectModel(Depot.name) private depotModel: Model<Depot>,
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    @InjectModel(Tournee.name) private tourneeModel: Model<Tournee>
  ) {}

  /** Génère le payload pour l’optimiseur, appelle l’API puis enregistre la tournée */
  async planifier(depotId: string) {
    this.logger.debug(`Démarrage planification pour dépôt ${depotId}`);

    // 1) Dépôt et coordonnées
    const depotDoc = await this.depotModel.findById(depotId).lean();
    if (!depotDoc) {
      this.logger.error(`Dépôt ${depotId} introuvable`);
      throw new NotFoundException("Dépôt introuvable");
    }
    const depotCoords = (depotDoc as any).localisation?.coordonnees;
    if (!depotCoords) {
      this.logger.error(`Coordonnées manquantes pour le dépôt ${depotId}`);
      throw new NotFoundException("Coordonnées manquantes pour le dépôt");
    }
    const startLocation = {
      latitude: depotCoords.latitude,
      longitude: depotCoords.longitude,
    };
    this.logger.debug(`Coordonnées dépôt : ${JSON.stringify(startLocation)}`);

    // 2) Commandes non livrées
    const OrderModel = this.clientModel.db.model("Order");
    const orders: any[] = await OrderModel.find({
      depot: depotId,
      confirmed: false,
    })
      .lean()
      .exec();
    this.logger.debug(`Commandes non-livrées trouvées : ${orders.length}`);

    // 3) Agrégation par client
    const clientMap: Record<
      string,
      { name: string; latitude: number; longitude: number; load: number }
    > = {};

    for (const o of orders) {
      this.logger.debug(`→ Traitement commande ${o._id} du client ${o.clientId}`);
      const cl = await this.clientModel.findById(o.clientId).lean();
      if (!cl) {
        this.logger.warn(`Client ${o.clientId} introuvable, on l’ignore`);
        continue;
      }

      const coord = (cl as any).localisation?.coordonnees;
      if (
        !coord ||
        typeof coord.latitude !== "number" ||
        typeof coord.longitude !== "number"
      ) {
        this.logger.warn(
          `Client ${cl.nom_client} (${o.clientId}) sans coordonnées GPS, on l’ignore`
        );
        continue;
      }
      this.logger.debug(
        `Coordonnées client ${cl.nom_client} : ${coord.latitude}, ${coord.longitude}`
      );

      const poidsCommande = o.items.reduce(
        (acc: number, it: any) =>
          acc + (parseFloat(it.poids ?? "0") || 0) * it.quantity,
        0
      );
      this.logger.debug(`Poids commande ${o._id} : ${poidsCommande}kg`);

      if (!clientMap[o.clientId]) {
        clientMap[o.clientId] = {
          name: cl.nom_client,
          latitude: coord.latitude,
          longitude: coord.longitude,
          load: 0,
        };
      }
      clientMap[o.clientId].load += poidsCommande;
    }

    // 4) Construction des stops
    const stops = Object.entries(clientMap).map(([id, c]) => {
      this.logger.debug(
        `Stop pour client ${c.name} (${id}) → load=${c.load}, loc=[${c.latitude},${c.longitude}]`
      );
      return {
        id,
        name: c.name,
        location: { latitude: c.latitude, longitude: c.longitude },
        duration: 10,
        load: c.load || 1,
        types: null,
        priority: null,
        time_windows: null,
      };
    });
    this.logger.log(`Total stops valides : ${stops.length}`);

    // 5) Parc véhicules
    const vehicles = await this.vehicleModel
      .find({
        depot_id: depotId,
        chauffeur_id: { $ne: null },
        livreur_id: { $ne: null },
      })
      .lean()
      .exec();
    this.logger.debug(`Véhicules disponibles : ${vehicles.length}`);

    const fleet = vehicles.map((v) => ({
      id: v._id.toString(),
      start_location: startLocation,
      end_location: startLocation,
      shift: { start: "08:00", end: "16:00" },
      capacity: v.capacity,
      types: null,
      speed_factor: 1.0,
    }));

    // 6) Payload
    const today = new Date().toISOString().slice(0, 10);
    const payload = {
      date_interval: {
        start: `${today}T08:00:00`,
        end: `${today}T16:00:00`,
      },
      stops,
      fleet,
    };
    this.logger.log(`Payload VRP : ${JSON.stringify(payload, null, 2)}`);

    // 7) Appel API optimisation
    if (!vrpConfig.url) {
      this.logger.error("VRP API URL non configurée");
      throw new Error("VRP API URL non configurée");
    }
    const { data } = await axios.post(
      vrpConfig.url,
      payload,
      vrpConfig.apiKey
        ? { headers: { Authorization: `Bearer ${vrpConfig.apiKey}` } }
        : undefined
    );
    this.logger.debug("Réponse API VRP reçue");

    // 8) Sauvegarde
    await this.tourneeModel.create({
      depot: depotId,
      date: new Date(),
      stops: stops.map((s) => s.id),
      vehicles: fleet.map((f) => f.id),
      solution: data.solution,
      unscheduled: data.unscheduled,
    });
    this.logger.log("Tournée enregistrée avec succès");

    return { success: true };
  }
}

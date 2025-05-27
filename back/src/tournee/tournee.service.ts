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

  /**
   * Appelle l’API VRP avec le payload fourni, sauvegarde la réponse en BDD,
   * et renvoie la réponse brute.
   */
  async proxyToVrpAndSave(depotId: string, payload: any) {
    this.logger.debug(`Proxy VRP pour dépôt ${depotId}`);

    if (!vrpConfig.url) {
      this.logger.error("VRP API URL non configurée");
      throw new Error("VRP API URL non configurée");
    }

    // 1) Appel à l’API VRP
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (vrpConfig.apiKey) {
      headers["x-api-key"] = vrpConfig.apiKey;
    }

    this.logger.debug(`Envoi payload VRP: ${JSON.stringify(payload)}`);
    const { data } = await axios.post(vrpConfig.url, payload, { headers });
    this.logger.debug("Réponse API VRP reçue");

    // 2) Sauvegarde en base
    await this.tourneeModel.create({
      depot: depotId,
      date: new Date(),
      stops: payload.stops.map((s: any) => s.id),
      vehicles: payload.fleet.map((f: any) => f.id),
      solution: data.solution,
      unscheduled: data.unscheduled,
      total_travel_time: data.total_travel_time,
      total_travel_distance: data.total_travel_distance,
      raw_response: data,
    });

    this.logger.log("Tournée enregistrée avec succès");
    return data;
  }
}

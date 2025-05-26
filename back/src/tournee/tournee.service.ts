import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';

import { Depot   } from '../depot/schemas/depot.schema';
import { Client  } from '../client/schemas/client.schema';
import { Vehicle } from '../vehicle/schemas/vehicle.schema';
import { Tournee } from './schemas/tournee.schema';

import { vrpConfig } from '../config/vrp.config';   // <— NOUVEAU

@Injectable()
export class TourneeService {
  constructor(
    @InjectModel(Depot.name)   private depotModel:   Model<Depot>,
    @InjectModel(Client.name)  private clientModel:  Model<Client>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<Vehicle>,
    @InjectModel(Tournee.name) private tourneeModel: Model<Tournee>,
  ) {}

  /** Génère le payload pour l’optimiseur, appelle l’API puis enregistre la tournée */
  async planifier(depotId: string) {

    /* ------------------------------------------------------------------ */
    /* 1) Dépôt et coordonnées                                             */
    /* ------------------------------------------------------------------ */
    const depotDoc = await this.depotModel.findById(depotId).lean();
    if (!depotDoc) throw new NotFoundException('Dépôt introuvable');

    const loc = (depotDoc as any).localisation?.coordonnees;
    if (!loc) throw new NotFoundException('Coordonnées manquantes pour le dépôt');

    const startLocation = { latitude: loc.latitude, longitude: loc.longitude };

    /* ------------------------------------------------------------------ */
    /* 2) Commandes non livrées                                            */
    /* ------------------------------------------------------------------ */
    const OrderModel = this.clientModel.db.model('Order');
    const orders: any[] = await OrderModel
      .find({ depot: depotId, confirmed: false })
      .lean();

    /* Agrégation par client */
    const clientMap: Record<string, {
      name: string;
      latitude: number;
      longitude: number;
      load: number;
    }> = {};

    for (const o of orders) {
      const cl = await this.clientModel.findById(o.clientId).lean();
      if (!cl) continue;

      const poidsCommande = o.items.reduce(
        (acc: number, it: any) =>
          acc + (parseFloat(it.poids ?? 0) || 0) * it.quantity,
        0,
      );

      if (!clientMap[o.clientId]) {
        const coord = (cl as any).localisation?.coordonnees ?? {};
        clientMap[o.clientId] = {
          name: cl.nom_client,
          latitude:  coord.latitude,
          longitude: coord.longitude,
          load: 0,
        };
      }
      clientMap[o.clientId].load += poidsCommande;
    }

    const stops = Object.entries(clientMap).map(([id, c]) => ({
      id,
      name: c.name,
      location: { latitude: c.latitude, longitude: c.longitude },
      duration: 10,
      load: c.load || 1,
      types: null,
      priority: null,
      time_windows: null,
    }));

    /* ------------------------------------------------------------------ */
    /* 3) Parc véhicules                                                   */
    /* ------------------------------------------------------------------ */
    const vehicles = await this.vehicleModel.find({
      depot_id: depotId,
      chauffeur_id: { $ne: null },
      livreur_id:   { $ne: null },
    }).lean();

    const fleet = vehicles.map((v) => ({
      id: v._id.toString(),
      start_location: startLocation,
      end_location:   startLocation,
      shift: { start: '08:00', end: '16:00' },
      capacity: v.capacity,
      types: null,
      speed_factor: 1.0,
    }));

    /* ------------------------------------------------------------------ */
    /* 4) Payload                                                          */
    /* ------------------------------------------------------------------ */
    const today = new Date().toISOString().slice(0, 10);
    const payload = {
      date_interval: {
        start: `${today}T08:00:00`,
        end:   `${today}T16:00:00`,
      },
      stops,
      fleet,
    };

    /* ------------------------------------------------------------------ */
    /* 5) Appel API optimisation                                           */
    /* ------------------------------------------------------------------ */
    if (!vrpConfig.url) {
      throw new Error('VRP API URL non configurée (.env ou secret/vrp.ts manquant).');
    }

    const { data } = await axios.post(
      vrpConfig.url,
      payload,
      vrpConfig.apiKey
        ? { headers: { Authorization: `Bearer ${vrpConfig.apiKey}` } }
        : undefined,
    );

    /* ------------------------------------------------------------------ */
    /* 6) Sauvegarde                                                       */
    /* ------------------------------------------------------------------ */
    await this.tourneeModel.create({
      depot: depotId,
      date: new Date(),
      stops: stops.map((s) => s.id),
      vehicles: fleet.map((f) => f.id),
      solution: data.solution,
      unscheduled: data.unscheduled,
    });

    return { success: true };
  }
}

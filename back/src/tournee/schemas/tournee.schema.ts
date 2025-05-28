// src/tournee/schemas/tournee.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Tournee extends Document {
  /* Identifiant du dépôt concerné */
  @Prop({ required: true })
  depot!: string;

  /* Date de la tournée (date de calcul) */
  @Prop({ required: true })
  date!: Date;

  /* Liste des IDs client (stops) planifiés */
  @Prop([String])
  stops!: string[];

  /* Liste des IDs véhicule utilisés */
  @Prop([String])
  vehicles!: string[];

  /* Liste des IDs des commandes incluses dans la tournée */
  @Prop([String])
  orderIds!: string[];

  /* Solution brute renvoyée par l'API d'optimisation */
  @Prop({ type: Object })
  solution!: unknown;

  /* Arrêts non planifiés par l'optimiseur */
  @Prop({ type: Array })
  unscheduled!: unknown[];

  /* Temps de trajet total (minutes) */
  @Prop()
  total_travel_time?: number;

  /* Distance totale parcourue (km) */
  @Prop()
  total_travel_distance?: number;

  /* Réponse brute complète de l'API VRP */
  @Prop({ type: Object })
  raw_response?: unknown;
}

export const TourneeSchema = SchemaFactory.createForClass(Tournee);

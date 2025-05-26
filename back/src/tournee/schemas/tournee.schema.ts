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

  /* Solution brute renvoyée par l’API d’optimisation */
  @Prop({ type: Object })
  solution!: unknown;

  /* Arrêts non planifiés par l’optimiseur */
  @Prop({ type: Array })
  unscheduled!: unknown[];
}

export const TourneeSchema = SchemaFactory.createForClass(Tournee);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true })
  make: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  year: string;

  @Prop({ required: true, unique: true })
  license_plate: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ required: true, type: [String], enum: ['normal', 'frigorifique'] })
  type: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  chauffeur_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  livreur_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Depot', required: true })
  depot_id: Types.ObjectId;

  /** Horaires de travail du conducteur par jour de la semaine. */
  @Prop({
    type: [{
      _id: false,
      day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
      shift: {
        start: { type: String, required: true }, // "HH:MM"
        end:   { type: String, required: true }
      }
    }],
    default: []
  })
  working_days: {
    day: string,
    shift: { start: string, end: string }
  }[];
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

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

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  chauffeur_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  livreur_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Depot', required: true })
  depot_id: Types.ObjectId;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
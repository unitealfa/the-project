
// ✅ back/src/depot/schemas/depot.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: false })
export class Depot {
  @Prop({ required: true }) nom_depot: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company_id: Types.ObjectId;

  @Prop({ required: true }) type_depot: string;
  @Prop({ required: true }) capacite: number;

  @Prop({
    type: { rue: String, ville: String, code_postal: String, pays: String },
    required: true,
    _id: false,
  })
  adresse: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };

  @Prop({
    type: { latitude: Number, longitude: Number },
    default: null,
    _id: false,
  })
  coordonnees?: {
    latitude: number;
    longitude: number;
  } | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  responsable_id: Types.ObjectId;

  @Prop({ type: Date, default: () => new Date() })
  date_creation: Date;
}

export type DepotDocument = Depot & Document;
export const DepotSchema = SchemaFactory.createForClass(Depot);

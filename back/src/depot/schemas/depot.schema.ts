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
    type: {
      responsable: String,
      telephone: String,
      email: String,
    },
    required: true,
  })
  contact: {
    responsable: string;
    telephone: string;
    email: string;
  };

  @Prop({
    type: {
      rue: String,
      ville: String,
      code_postal: String,
      pays: String,
    },
    required: true,
  })
  adresse: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };

  @Prop({
    type: { latitude: Number, longitude: Number },
    required: false,
    default: null,
  })
  coordonnees?: { latitude: number; longitude: number };

  @Prop({ type: Date, default: () => new Date() })
  date_creation: Date;
}

export type DepotDocument = Depot & Document;
export const DepotSchema = SchemaFactory.createForClass(Depot);

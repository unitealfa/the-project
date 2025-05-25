// src/product/schema/product.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

interface Specification {
  poids?: string;
  volume?: string;
}

interface Disponibilite {
  depot_id: Types.ObjectId;
  quantite: number;
}

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  nom_product: string;

  @Prop({ required: true })
  prix_gros: number;

  @Prop({ required: true })
  prix_detail: number;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  categorie: string;

  @Prop({ required: true, type: [String], enum: ['normal', 'frigorifique'] })
  type: string[];

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Object })
  specifications: Specification;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  company_id: Types.ObjectId;

  @Prop({ type: [{ depot_id: { type: MongooseSchema.Types.ObjectId, ref: 'Depot' }, quantite: Number }], default: [] })
  disponibilite: Disponibilite[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
export type ProductDocument = Product & Document;

// BACKEND - Schéma Mongoose du produit
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  nom_product: string;

  @Prop({ required: true })
  prix_gros: number;

  @Prop({ required: true })
  prix_detail: number;

  @Prop()
  description: string;

  @Prop()
  categorie: string;

  @Prop([String])
  images: string[];

  @Prop({ type: Object })
  specifications: {
    poids: string;
    volume: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  company_id: Types.ObjectId;

  @Prop([
    {
      depot_id: { type: Types.ObjectId, ref: 'Depot' },
      quantite: Number,
    },
  ])
  disponibilite: { depot_id: Types.ObjectId; quantite: number }[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

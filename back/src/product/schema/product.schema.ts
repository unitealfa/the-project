import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ required: true })
  nom_product: string;

  @Prop({ required: true })
  prix_gros: number;

  @Prop({ required: true })
  prix_detail: number;

  @Prop({ required: true })
  date_expiration: Date;

  @Prop({ required: true })
  quantite_stock: number;

  @Prop()
  description: string;

  @Prop()
  categorie: string;

  @Prop([String])
  images: string[];

  @Prop({
    type: {
      poids: String,
      volume: String,
    },
    default: {},
  })
  specifications: { poids: string; volume: string };
}

export const ProductSchema = SchemaFactory.createForClass(Product);

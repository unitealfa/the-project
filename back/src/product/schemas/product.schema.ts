import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

interface Specification {
  poids?: string;
  volume?: string;
}

interface Disponibilite {
  depot_id: string;
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

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Object })
  specifications: Specification;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Company' })
  company_id: string;

  @Prop({ type: [{ depot_id: String, quantite: Number }], default: [] })
  disponibilite: Disponibilite[];
}

export const ProductSchema = SchemaFactory.createForClass(Product); 
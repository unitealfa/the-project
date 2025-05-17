import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true }) clientId: string;
  @Prop({ required: true }) nom_client: string;
  @Prop({ required: true }) telephone: string;
  @Prop({ required: true }) depot: string;

  // AJOUT
  @Prop() depot_name?: string;
  @Prop() numero?: string;

  @Prop({
    type: {
      adresse: String,
      ville: String,
      code_postal: String,
      region: String
    },
    default: null
  })
  adresse_client?: {
    adresse?: string;
    ville?: string;
    code_postal?: string;
    region?: string;
  };

  @Prop([
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true },
      productName: { type: String, required: true },
      prix_detail: { type: Number, required: true }
    }
  ])
  items: Array<{
    productId: string;
    quantity: number;
    productName: string;
    prix_detail: number;
  }>;

  @Prop({ required: true }) total: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

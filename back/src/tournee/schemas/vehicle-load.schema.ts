import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class VehicleLoad extends Document {
  @Prop({ required: true })
  vehicle_id: string;

  @Prop({ required: true })
  tournee_id: string;

  @Prop([{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    poids: { type: Number, required: true }
  }])
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    poids: number;
  }>;

  @Prop({ required: true })
  total_weight: number;

  @Prop({ required: true })
  client_id: string;

  @Prop({ required: true })
  client_name: string;
}

export const VehicleLoadSchema = SchemaFactory.createForClass(VehicleLoad); 
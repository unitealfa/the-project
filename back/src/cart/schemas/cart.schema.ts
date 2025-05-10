import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop([{
    _id: { type: Types.ObjectId, auto: true, required: false },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }])
  items: Array<{
    _id?: Types.ObjectId;
    productId: string;
    quantity: number;
  }>;
}

export const CartSchema = SchemaFactory.createForClass(Cart); 
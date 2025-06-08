import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LoyaltyReward extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop({ enum: ['points', 'spend'], default: 'points' })
  type: 'points' | 'spend';

  @Prop({ required: true })
  points: number;

  @Prop()
  amount?: number;

  @Prop({ default: false })
  delivered: boolean;
}

export const LoyaltyRewardSchema = SchemaFactory.createForClass(LoyaltyReward);
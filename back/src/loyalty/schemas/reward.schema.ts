import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LoyaltyReward extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Client', required: true })
  client: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company: Types.ObjectId;

  @Prop({ enum: ['points', 'spend', 'repeat'], default: 'points' })
  type: 'points' | 'spend' | 'repeat';

  @Prop({ required: true })
  points: number;

  @Prop()
  amount?: number;

  @Prop({ default: false })
  
  @Prop({ default: false })
  notified: boolean;
  delivered: boolean;
}

export const LoyaltyRewardSchema = SchemaFactory.createForClass(LoyaltyReward);
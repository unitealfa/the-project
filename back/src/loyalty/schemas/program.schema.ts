import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class LoyaltyTier {
  @Prop({ required: true }) points: number;
  @Prop({ required: true }) reward: string;
  @Prop() image: string;
}

@Schema({ timestamps: true })
export class LoyaltyProgram extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Company', unique: true, required: true })
  company: Types.ObjectId;

  @Prop({
    type: { amount: Number, points: Number },
    default: { amount: 500, points: 5 },
  })
  ratio: { amount: number; points: number };

  @Prop({ type: [LoyaltyTier], default: [] })
  tiers: LoyaltyTier[];
  
  @Prop({
    type: { amount: Number, reward: String },
    default: null,
  })
  spendReward?: { amount: number; reward: string } | null;
  
  @Prop({ type: { every: Number, reward: String, image: String }, default: null })
  repeatReward?: { every: number; reward: string; image?: string } | null;
}

export const LoyaltyTierSchema = SchemaFactory.createForClass(LoyaltyTier);
export const LoyaltyProgramSchema = SchemaFactory.createForClass(LoyaltyProgram);
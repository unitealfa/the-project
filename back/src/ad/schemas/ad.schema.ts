import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdDocument = Ad & Document;

@Schema({ timestamps: true })
export class Ad {
  @Prop({ type: Types.ObjectId, ref: 'Company', required: true })
  company!: Types.ObjectId;

  @Prop({ required: true })
  type!: 'image' | 'video';

  @Prop()
  duration?: number;

  @Prop({ required: true })
  filePath!: string;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const AdSchema = SchemaFactory.createForClass(Ad);
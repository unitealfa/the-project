import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Reclamation extends Document {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  clientId: string;

  @Prop({ required: true })
  titre: string;

  @Prop({ required: true })
  message: string;

  @Prop({ 
    type: String, 
    enum: ['en_attente', 'en_cours', 'resolue'],
    default: 'en_attente'
  })
  status: string;

  @Prop()
  reponse?: string;

  @Prop()
  reponseDate?: Date;
}

export const ReclamationSchema = SchemaFactory.createForClass(Reclamation); 
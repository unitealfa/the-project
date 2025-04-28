import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Adresse {
  @Prop() rue: string;
  @Prop() ville: string;
  @Prop() code_postal: string;
  @Prop() pays: string;
}

@Schema({ timestamps: true })
export class Company {
  @Prop({ required: true }) nom_company: string;
  @Prop({ required: true }) gerant_company: string;
  @Prop({ type: Adresse, required: true }) contact: Adresse;
}

export type CompanyDocument = Company & Document;
export const CompanySchema = SchemaFactory.createForClass(Company);


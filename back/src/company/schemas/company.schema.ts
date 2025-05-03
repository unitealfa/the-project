import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false })
export class Company {
  @Prop({ required: true })
  nom_company: string;

  @Prop({
    type: {
      rue: String,
      ville: String,
      code_postal: String,
      pays: String,
    },
    required: true,
  })
  adresse: {
    rue: string;
    ville: string;
    code_postal: string;
    pays: string;
  };
}

export type CompanyDocument = Company & Document;
export const CompanySchema = SchemaFactory.createForClass(Company);

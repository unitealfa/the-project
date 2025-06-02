import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: false })
export class Company {
  @Prop({ required: true })
  nom_company: string;

  @Prop({ required: true })
  gerant_company: string;

  @Prop({
    type: {
      telephone: String,
      email: String,
      adresse: {
        rue: String,
        ville: String,
        code_postal: String,
        pays: String,
      },
    },
    required: true,
  })
  contact: {
    telephone: string;
    email: string;
    adresse: {
      rue: string;
      ville: string;
      code_postal: string;
      pays: string;
    };
  };

  @Prop({
    type: String,
    default: 'images/default-company.jfif',
  })
  pfp: string;
}

export type CompanyDocument = Company & Document;
export const CompanySchema = SchemaFactory.createForClass(Company);

// back/src/team/schemas/member.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types }             from 'mongoose';

@Schema({ timestamps: true })
export class Member {
  /** Référence vers l’entrepôt */
  @Prop({ type: Types.ObjectId, ref: 'Depot', required: true })
  depotId!: Types.ObjectId;

  /** Catégorie d’équipe */
  @Prop({ enum: ['livraison', 'prevente', 'entrepot'], required: true })
  role!: 'livraison' | 'prevente' | 'entrepot';

  @Prop({ required: true })
  nom!: string;

  @Prop({ required: true })
  prenom!: string;
}

export type MemberDocument = Member & Document;
export const MemberSchema = SchemaFactory.createForClass(Member);

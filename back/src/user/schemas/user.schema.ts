import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types }             from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })               nom    : string;
  @Prop({ required: true })               prenom : string;
  @Prop({ required: true, unique: true }) email  : string;
  @Prop({ required: true, select: false })password: string;

  /** Fonction précise stockée dans `role` */
  @Prop({
    required: true,
    enum: [
      'Administrateurs des ventes',
      'Livreurs',
      'Chauffeurs',
      'Superviseurs des ventes',
      'Pré vendeurs',
      'Gestionnaire de stock',
      'Contrôleur',
      'Manutentionnaire',
    ],
  })
  role!: string;

  /** Catégorie d’équipe stockée dans `poste` */
  @Prop({
    required: true,
    enum: ['Livraison', 'Prévente', 'Entrepôt'],
  })
  poste!: string;

  @Prop({ type: Types.ObjectId, ref: 'Company', default: null })
  company!: Types.ObjectId | null;
  @Prop({ type: Types.ObjectId, ref: 'Depot', default: null })
  depot!: Types.ObjectId | null;
  @Prop() num!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

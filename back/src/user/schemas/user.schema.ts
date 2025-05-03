import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true }) nom: string;

  @Prop({ required: true }) prenom: string;

  @Prop({ required: true, unique: true }) email: string;

  /** ⚠️ Sécurité : rendre le hash non sélectionné par défaut */
  @Prop({ required: true, select: false }) password: string;

  /**
   *  Rôles possibles :
   *  - cœur d’app : Super Admin / Admin
   *  - équipes dépôt : livraison | prevente | entrepot
   *  - responsable dépôt : responsable depot
   *  - (optionnel) User = compte sans privilège particulier
   */
  @Prop({
    default: 'User',
    enum: [
      'Super Admin',
      'Admin',
      'User',
      'responsable depot',
      'livraison',
      'prevente',
      'entrepot',
    ],
  })
  role: string;

  /** Société (null pour Super Admin) */
  @Prop({ type: Types.ObjectId, ref: 'Company', default: null })
  company: Types.ObjectId | null;

  /** Dépôt d’affectation (null si non concerné) */
  @Prop({ type: Types.ObjectId, ref: 'Depot', default: null })
  depot: Types.ObjectId | null;

  /** Téléphone */
  @Prop() num: string;

  /** Fonction précise (ex : “Livreur”, “Chauffeur”) */
  @Prop() fonction?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

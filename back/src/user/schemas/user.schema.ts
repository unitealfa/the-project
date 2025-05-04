import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // ⏱️ active createdAt + updatedAt
export class User {
  @Prop({ required: true })
  nom: string;

  @Prop({ required: true })
  prenom: string;

  @Prop({ required: true, unique: true })
  email: string;

  /** ⚠️ hash du mot de passe, non sélectionné par défaut */
  @Prop({ required: true, select: false })
  password: string;

  /**
   * Rôles autorisés :
   * - Super Admin : gestion globale
   * - Admin : gestion société
   * - User : sans privilèges
   * - responsable depot : chef de dépôt
   * - livraison / prevente / entrepot : équipes opérationnelles
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

  /** Lien vers la société (optionnel) */
  @Prop({ type: Types.ObjectId, ref: 'Company', default: null })
  company: Types.ObjectId | null;

  /** Lien vers un dépôt (si concerné) */
  @Prop({ type: Types.ObjectId, ref: 'Depot', default: null })
  depot: Types.ObjectId | null;

  /** Numéro de téléphone */
  @Prop()
  num: string;

  /** Fonction métier précise (livreur, chauffeur…) */
  @Prop()
  fonction?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

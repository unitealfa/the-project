import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/* ───── Sous-documents ───── */
@Schema({ _id: false })
class Coordonnees {
  @Prop() latitude: number;
  @Prop() longitude: number;
}

@Schema({ _id: false })
class Contact {
  @Prop() nom_gerant: string;
  @Prop() telephone: string;
}

@Schema({ _id: false })
class Localisation {
  @Prop() adresse: string;
  @Prop() ville: string;
  @Prop() code_postal: string;
  @Prop() region: string;
  @Prop({ type: Coordonnees }) coordonnees: Coordonnees;
}

@Schema({ _id: false })
class Statistiques {
  @Prop({ default: 0 }) montant_total_commandes: number;
  @Prop({ default: 0 }) nombre_commandes: number;
  @Prop({ default: null }) derniere_commande: Date;
}

/* ───── Schéma principal ───── */
@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ required: true }) nom_client: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ required: true }) password: string;
  @Prop({ default: 'Client' }) role: string;

  @Prop({ type: Contact, required: true }) contact: Contact;
  @Prop({ type: Types.ObjectId, ref: 'Depot' }) depot: Types.ObjectId;
  @Prop({ type: Localisation, required: true }) localisation: Localisation;

  @Prop({ default: 0 }) fidelite_points: number;
  @Prop({ type: Statistiques, default: () => ({}) }) statistiques: Statistiques;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

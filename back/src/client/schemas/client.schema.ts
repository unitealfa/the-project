import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ _id: false })
class Coordonnees {
  // Store coordinates as floating point numbers (double precision)
  @Prop({ type: Number })
  latitude: number;

  @Prop({ type: Number })
  longitude: number;
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

@Schema({ _id: false })
class Affectation {
  @Prop({ type: Types.ObjectId, ref: 'Entreprise' }) entreprise: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Depot' }) depot: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User' }) prevendeur_id?: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Client extends Document {
  @Prop({ required: true }) nom_client: string;
  @Prop({ required: true, unique: true }) email: string;
  @Prop({ 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(v);
      },
      message: 'Le mot de passe doit contenir au moins 6 caractères, une lettre majuscule et un chiffre'
    }
  }) password: string;
  @Prop({ default: 'Client' }) role: string;

  @Prop({ type: Contact, required: true }) contact: Contact;
  @Prop({ type: Localisation, required: true }) localisation: Localisation;
  @Prop([Affectation]) affectations: Affectation[];

  @Prop({ type: Map, of: Number, default: {} })
  fidelite_points: Record<string, number>;
  
  @Prop({ type: Map, of: Number, default: {} })
  spend_since_last_reward: Record<string, number>;

  @Prop({ type: Map, of: Number, default: {} })
  loyalty_baseline: Record<string, number>;
  
  @Prop({ type: Map, of: Number, default: {} })
  points_since_last_repeat: Record<string, number>;
  @Prop({ type: Statistiques, default: () => ({}) }) statistiques: Statistiques;
  @Prop()
  pfp: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ required: true }) clientId: string;
  @Prop({ required: true }) nom_client: string;
  @Prop({ required: true }) telephone: string;
  @Prop({ required: true }) depot: string;

  // Optionnel mais initialisé à null ou chaîne vide
  @Prop() depot_name?: string;

  // Numéro de commande attribué APRES confirmation
  @Prop({ default: null }) numero?: string | null;

  // Confirmation de la commande (false par défaut)
  @Prop({ default: false }) confirmed: boolean;

  @Prop({
    type: {
      adresse: String,
      ville: String,
      code_postal: String,
      region: String,
    },
    default: null,
  })
  adresse_client?: {
    adresse?: string;
    ville?: string;
    code_postal?: string;
    region?: string;
  };

  @Prop([
    {
      productId: { type: String, required: true },
      quantity: { type: Number, required: true },
      productName: { type: String, required: true },
      prix_detail: { type: Number, required: true },
    },
  ])
  items: Array<{
    productId: string;
    quantity: number;
    productName: string;
    prix_detail: number;
  }>;

  @Prop({ required: true }) total: number;

    @Prop({
    default: 'en_attente',
    enum: ['en_attente', 'en_cours', 'livree', 'non_livree'],
  })
  etat_livraison!: string;

    // Motif de non livraison le cas échéant
  @Prop()
  nonLivraisonCause?: string;

  @Prop({ default: 'en_attente', enum: ['en_attente', 'en_cours', 'charge'] })
  statut_chargement!: string;

  @Prop({
    type: [
      {
        url: { type: String, required: true },
        takenAt: { type: Date, required: true }
      }
    ],
    default: []
  })
  photosLivraison: Array<{ url: string; takenAt: Date }>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

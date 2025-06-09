import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  nom!: string;

  @Prop({ required: true })
  prenom!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  num!: string;

  @Prop({ 
    required: true,
    validate: {
      validator: function(v: string) {
        return /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(v);
      },
      message: 'Le mot de passe doit contenir au moins 6 caractères, une lettre majuscule et un chiffre'
    }
  })
  password!: string;

  /**
   * Rôles globaux ET fonctions métiers
   * - management : Admin, Super Admin, responsable depot
   * - équipe    : fonctions métiers (job titles)
   */
  @Prop({
    required: true,
    enum: [
      "Super Admin", // ← management
      "Admin", // ← management
      "responsable depot", // ← management
      "Administrateur des ventes",
      "Livreur",
      "Chauffeur",
      "Superviseur des ventes",
      "Pré-vendeur",
      "Gestionnaire de stock",
      "Contrôleur",
      "Manutentionnaire",
    ],
  })
  role!: string;

  /**
   * Catégorie d'équipe (Livraison|Prévente|Entrepôt)
   * – requise seulement pour les membres d'équipe (lorsque role est un job title)
   */
  @Prop({
    enum: ["Livraison", "Prévente", "Entrepôt"],
    required(this: User) {
      // si role est l'un des job titles, alors poste est obligatoire
      const jobs = [
        "Administrateur des ventes",
        "Livreur",
        "Chauffeur",
        "Superviseur des ventes",
        "Pré-vendeur",
        "Gestionnaire de stock",
        "Contrôleur",
        "Manutentionnaire",
      ];
      return jobs.includes(this.role);
    },
  })
  poste!: string;

  @Prop({ type: Types.ObjectId, ref: "Company", required: true })
  company!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Depot", required: true })
  depot!: Types.ObjectId;

  @Prop({ default: "images/default-user.webp" })
  pfp!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

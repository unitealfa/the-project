import { Document, Types } from 'mongoose';
export declare class Depot {
    nom_depot: string;
    company_id: Types.ObjectId;
    type_depot: string;
    capacite: number;
    contact: {
        responsable: string;
        telephone: string;
        email: string;
    };
    adresse: {
        rue: string;
        ville: string;
        code_postal: string;
        pays: string;
    };
    coordonnees?: {
        latitude: number;
        longitude: number;
    };
    date_creation: Date;
}
export type DepotDocument = Depot & Document;
export declare const DepotSchema: import("mongoose").Schema<Depot, import("mongoose").Model<Depot, any, any, any, Document<unknown, any, Depot> & Depot & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Depot, Document<unknown, {}, import("mongoose").FlatRecord<Depot>> & import("mongoose").FlatRecord<Depot> & {
    _id: Types.ObjectId;
}>;

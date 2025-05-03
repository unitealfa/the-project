import { Document } from 'mongoose';
export declare class Company {
    nom_company: string;
    adresse: {
        rue: string;
        ville: string;
        code_postal: string;
        pays: string;
    };
}
export type CompanyDocument = Company & Document;
export declare const CompanySchema: import("mongoose").Schema<Company, import("mongoose").Model<Company, any, any, any, Document<unknown, any, Company> & Company & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Company, Document<unknown, {}, import("mongoose").FlatRecord<Company>> & import("mongoose").FlatRecord<Company> & {
    _id: import("mongoose").Types.ObjectId;
}>;

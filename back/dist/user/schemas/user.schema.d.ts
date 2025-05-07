import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: string;
    poste: string;
    company: Types.ObjectId | null;
    depot: Types.ObjectId | null;
    num: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: Types.ObjectId;
}>;

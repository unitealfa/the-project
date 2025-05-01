import { Document, Types } from 'mongoose';
export declare class Member {
    depotId: Types.ObjectId;
    role: 'livraison' | 'prevente' | 'entrepot';
    fonction?: string;
    nom: string;
    prenom: string;
}
export type MemberDocument = Member & Document;
export declare const MemberSchema: import("mongoose").Schema<Member, import("mongoose").Model<Member, any, any, any, Document<unknown, any, Member> & Member & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Member, Document<unknown, {}, import("mongoose").FlatRecord<Member>> & import("mongoose").FlatRecord<Member> & {
    _id: Types.ObjectId;
}>;

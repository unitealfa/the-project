import { Model, Types } from 'mongoose';
import { DepotDocument } from '../depot/schemas/depot.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { CreateMemberDto, UpdateMemberDto } from './dto/create-member.dto';
export declare class TeamService {
    private readonly depotModel;
    private readonly userModel;
    constructor(depotModel: Model<DepotDocument>, userModel: Model<UserDocument>);
    listByDepot(depotId: string, userId: string, poste?: 'Livraison' | 'Prévente' | 'Entrepôt'): Promise<{
        [x: string]: (import("mongoose").FlattenMaps<UserDocument> & {
            _id: Types.ObjectId;
        })[];
        livraison?: undefined;
        prevente?: undefined;
        entrepot?: undefined;
    } | {
        livraison: (import("mongoose").FlattenMaps<UserDocument> & {
            _id: Types.ObjectId;
        })[];
        prevente: (import("mongoose").FlattenMaps<UserDocument> & {
            _id: Types.ObjectId;
        })[];
        entrepot: (import("mongoose").FlattenMaps<UserDocument> & {
            _id: Types.ObjectId;
        })[];
    }>;
    addMember(depotId: string, dto: CreateMemberDto, userId: string): Promise<{
        nom: string;
        prenom: string;
        email: string;
        role: string;
        poste: string;
        company: Types.ObjectId | null;
        depot: Types.ObjectId | null;
        num: string;
        _id: any;
        __v?: any;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
    }>;
    removeMember(memberId: string, adminId: string): Promise<{
        deleted: boolean;
    }>;
    private guardDepot;
    findOneMember(memberId: string, userId: string): Promise<import("mongoose").FlattenMaps<UserDocument> & {
        _id: Types.ObjectId;
    }>;
    updateMember(memberId: string, dto: UpdateMemberDto, userId: string): Promise<{
        nom: string;
        prenom: string;
        email: string;
        role: string;
        poste: string;
        company: Types.ObjectId | null;
        depot: Types.ObjectId | null;
        num: string;
        _id: any;
        __v?: any;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
    }>;
}

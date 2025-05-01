import { Model, Types } from 'mongoose';
import { DepotDocument } from '../depot/schemas/depot.schema';
import { UserDocument } from '../user/schemas/user.schema';
import { CreateMemberDto } from './dto/create-member.dto';
export declare class TeamService {
    private readonly depotModel;
    private readonly userModel;
    constructor(depotModel: Model<DepotDocument>, userModel: Model<UserDocument>);
    listByDepot(depotId: string, adminId: string, role?: 'livraison' | 'prevente' | 'entrepot'): Promise<{
        [role]: (import("mongoose").FlattenMaps<UserDocument> & {
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
    addMember(depotId: string, dto: CreateMemberDto, adminId: string): Promise<{
        nom: string;
        prenom: string;
        email: string;
        role: string;
        company: Types.ObjectId | null;
        depot: Types.ObjectId | null;
        num: string;
        fonction?: string;
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
}

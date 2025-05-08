import { TeamService } from './team.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/create-member.dto';
export declare class TeamController {
    private readonly svc;
    private readonly logger;
    constructor(svc: TeamService);
    getMyTeam(req: any): Promise<{
        [x: string]: (import("mongoose").FlattenMaps<import("../user/schemas/user.schema").UserDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        livraison?: undefined;
        prevente?: undefined;
        entrepot?: undefined;
    } | {
        livraison: (import("mongoose").FlattenMaps<import("../user/schemas/user.schema").UserDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        prevente: (import("mongoose").FlattenMaps<import("../user/schemas/user.schema").UserDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        entrepot: (import("mongoose").FlattenMaps<import("../user/schemas/user.schema").UserDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    list(depotId: string, req: any, poste?: 'Livraison' | 'Prévente' | 'Entrepôt'): Promise<{
        [x: string]: (import("mongoose").FlattenMaps<import("../user/schemas/user.schema").UserDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        livraison?: undefined;
        prevente?: undefined;
        entrepot?: undefined;
    } | {
        livraison: (import("mongoose").FlattenMaps<import("../user/schemas/user.schema").UserDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        prevente: (import("mongoose").FlattenMaps<import("../user/schemas/user.schema").UserDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        entrepot: (import("mongoose").FlattenMaps<import("../user/schemas/user.schema").UserDocument> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    getMember(memberId: string, req: any): Promise<import("mongoose").FlattenMaps<import("../user/schemas/user.schema").UserDocument> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    addMember(depotId: string, dto: CreateMemberDto, req: any): Promise<{
        nom: string;
        prenom: string;
        email: string;
        role: string;
        poste?: string;
        company: import("mongoose").Types.ObjectId | null;
        depot: import("mongoose").Types.ObjectId | null;
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
    updateMember(memberId: string, dto: UpdateMemberDto, req: any): Promise<{
        nom: string;
        prenom: string;
        email: string;
        role: string;
        poste?: string;
        company: import("mongoose").Types.ObjectId | null;
        depot: import("mongoose").Types.ObjectId | null;
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
    remove(memberId: string, req: any): Promise<{
        deleted: boolean;
    }>;
}

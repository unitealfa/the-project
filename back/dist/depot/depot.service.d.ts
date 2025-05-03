import { Model } from 'mongoose';
import { Depot, DepotDocument } from './schemas/depot.schema';
import { CreateDepotDto } from './dto/create-depot.dto';
import { UserDocument } from '../user/schemas/user.schema';
export declare class DepotService {
    private depotModel;
    private userModel;
    constructor(depotModel: Model<DepotDocument>, userModel: Model<UserDocument>);
    create(dto: CreateDepotDto, adminId: string): Promise<Depot>;
    findAllForCompany(adminId: string): Promise<Depot[]>;
    findOne(id: string, user: any): Promise<Depot>;
    update(id: string, dto: Partial<CreateDepotDto>, adminId: string): Promise<Depot>;
    remove(id: string, adminId: string): Promise<void>;
}

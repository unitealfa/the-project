import { Model } from 'mongoose';
import { Depot, DepotDocument } from './schemas/depot.schema';
import { CreateDepotDto } from './dto/create-depot.dto';
import { UserDocument } from '../user/schemas/user.schema';
export declare class DepotService {
    private depotModel;
    private userModel;
    constructor(depotModel: Model<DepotDocument>, userModel: Model<UserDocument>);
    create(createDto: CreateDepotDto, userId: string): Promise<Depot>;
    findAllForCompany(userId: string): Promise<Depot[]>;
    findOne(id: string, userId: string): Promise<Depot>;
    update(id: string, dto: Partial<CreateDepotDto>, userId: string): Promise<Depot>;
    remove(id: string, userId: string): Promise<void>;
}

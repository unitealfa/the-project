import { DepotService } from './depot.service';
import { CreateDepotDto } from './dto/create-depot.dto';
export declare class DepotController {
    private readonly svc;
    private readonly logger;
    constructor(svc: DepotService);
    create(dto: CreateDepotDto, req: any): Promise<import("./schemas/depot.schema").Depot>;
    findAllForMe(req: any): Promise<import("./schemas/depot.schema").Depot[]>;
    findOne(id: string, req: any): Promise<import("./schemas/depot.schema").Depot>;
    update(id: string, dto: Partial<CreateDepotDto>, req: any): Promise<import("./schemas/depot.schema").Depot>;
    remove(id: string, req: any): Promise<void>;
}

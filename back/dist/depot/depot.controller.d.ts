import { Request } from 'express';
import { DepotService } from './depot.service';
import { CreateDepotDto } from './dto/create-depot.dto';
export declare class DepotController {
    private readonly depotService;
    constructor(depotService: DepotService);
    create(dto: CreateDepotDto, req: Request & {
        user: any;
    }): Promise<import("./schemas/depot.schema").Depot>;
    findAll(req: Request & {
        user: any;
    }): Promise<import("./schemas/depot.schema").Depot[]>;
    findOne(id: string, req: Request & {
        user: any;
    }): Promise<import("./schemas/depot.schema").Depot>;
    update(id: string, dto: Partial<CreateDepotDto>, req: Request & {
        user: any;
    }): Promise<import("./schemas/depot.schema").Depot>;
    remove(id: string, req: Request & {
        user: any;
    }): Promise<void>;
}

import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
export declare class CompanyController {
    private readonly svc;
    private readonly logger;
    constructor(svc: CompanyService);
    create(companyData: CreateCompanyDto, adminData: CreateAdminDto): Promise<{
        company: import("mongoose").Document<unknown, {}, import("./schemas/company.schema").CompanyDocument> & import("./schemas/company.schema").Company & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
        admin: import("mongoose").Document<unknown, {}, import("../user/schemas/user.schema").UserDocument> & import("../user/schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        };
    }>;
    findAll(): Promise<(import("./schemas/company.schema").Company & {
        admin: {
            nom: string;
            prenom: string;
            email: string;
        } | null;
    })[]>;
    findOne(id: string): Promise<import("./schemas/company.schema").Company>;
    update(id: string, dto: Partial<CreateCompanyDto>): Promise<import("./schemas/company.schema").Company>;
    remove(id: string): Promise<{
        message: string;
    }>;
}

import { Model, Types } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { User, UserDocument } from '../user/schemas/user.schema';
import { Depot } from '../depot/schemas/depot.schema';
import { Client } from '../client/schemas/client.schema';
export declare class CompanyService {
    private companyModel;
    private userModel;
    private depotModel;
    private clientModel;
    constructor(companyModel: Model<CompanyDocument>, userModel: Model<UserDocument>, depotModel: Model<Depot>, clientModel: Model<Client>);
    createWithAdmin(companyData: CreateCompanyDto, adminData: CreateAdminDto): Promise<{
        company: import("mongoose").Document<unknown, {}, CompanyDocument> & Company & import("mongoose").Document<any, any, any> & {
            _id: Types.ObjectId;
        };
        admin: import("mongoose").Document<unknown, {}, UserDocument> & User & import("mongoose").Document<any, any, any> & {
            _id: Types.ObjectId;
        };
    }>;
    findOne(id: string): Promise<Company>;
    findAll(): Promise<Array<Company & {
        admin: {
            nom: string;
            prenom: string;
            email: string;
        } | null;
    }>>;
    update(id: string, dto: Partial<CreateCompanyDto>): Promise<Company>;
    delete(id: string): Promise<void>;
}

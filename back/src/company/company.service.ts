// back/src/company/company.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcrypt";

import { Company, CompanyDocument } from "./schemas/company.schema";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { User, UserDocument } from "../user/schemas/user.schema";
import { Depot } from "../depot/schemas/depot.schema";
import { Client } from "../client/schemas/client.schema";

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Depot.name) private depotModel: Model<Depot>,
    @InjectModel(Client.name) private clientModel: Model<Client>
  ) {}

  async createWithAdmin(
    companyData: CreateCompanyDto,
    adminData: CreateAdminDto,
    pfpPath?: string
  ) {
    const exists = await this.companyModel.findOne({
      nom_company: companyData.nom_company,
    });
    if (exists) {
      throw new ConflictException(
        `L’entreprise '${companyData.nom_company}' existe déjà.`
      );
    }

    const userExists = await this.userModel.findOne({ email: adminData.email });
    const clientExists = await this.clientModel.findOne({
      email: adminData.email,
    });
    if (userExists || clientExists) {
      throw new ConflictException(
        `L’email '${adminData.email}' est déjà utilisé.`
      );
    }

    const companyObj: Partial<Company> = { ...companyData };
    if (pfpPath) {
      companyObj.pfp = pfpPath;
    }
    const company = new this.companyModel(companyObj);
    await company.save();

    const hashed = await bcrypt.hash(adminData.password, 10);
    const admin = new this.userModel({
      ...adminData,
      password: hashed,
      role: "Admin",
      company: company._id,
    });
    await admin.save();

    return { company, admin };
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyModel.findById(id).lean();
    if (!company) throw new NotFoundException(`Société ${id} introuvable.`);
    return company;
  }

  async findAll(): Promise<
    Array<
      Company & { admin: { nom: string; prenom: string; email: string } | null }
    >
  > {
    const companies = await this.companyModel.find().lean();
    return Promise.all(
      companies.map(async (c) => {
        const admin = await this.userModel
          .findOne({ company: c._id, role: "Admin" })
          .lean()
          .select("nom prenom email");
        return {
          ...c,
          admin: admin
            ? { nom: admin.nom, prenom: admin.prenom, email: admin.email }
            : null,
        };
      })
    );
  }

  async update(
    id: string,
    dto: Partial<CreateCompanyDto>,
    pfpPath?: string
  ): Promise<Company> {
    const updateObj: Partial<Company> = { ...dto };
    if (pfpPath) {
      updateObj.pfp = pfpPath;
    }

    const updated = await this.companyModel
      .findByIdAndUpdate(id, updateObj, { new: true, runValidators: true })
      .lean();
    if (!updated) {
      throw new NotFoundException(
        `Société ${id} introuvable pour mise à jour.`
      );
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const companyObjectId = new Types.ObjectId(id);

    await this.userModel.deleteMany({ company: companyObjectId });
    await this.clientModel.deleteMany({ company: companyObjectId });
    await this.depotModel.deleteMany({ company_id: companyObjectId });

    const result = await this.companyModel
      .findByIdAndDelete(companyObjectId)
      .exec();
    if (!result)
      throw new NotFoundException(
        `Société ${id} introuvable pour suppression.`
      );
  }
}

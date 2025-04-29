// back/src/company/company.service.ts

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel }                                        from '@nestjs/mongoose';
import { Model }                                              from 'mongoose';
import * as bcrypt                                            from 'bcrypt';

import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto }         from './dto/create-company.dto';
import { CreateAdminDto }           from './dto/create-admin.dto';
import { User, UserDocument }       from '../user/schemas/user.schema';

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    @InjectModel(User.name)    private userModel:    Model<UserDocument>,
  ) {}

  /** Crée une company + son Admin */
  async createWithAdmin(companyData: CreateCompanyDto, adminData: CreateAdminDto) {
    const exists = await this.companyModel.findOne({ nom_company: companyData.nom_company });
    if (exists) {
      throw new ConflictException(`L’entreprise '${companyData.nom_company}' existe déjà.`);
    }

    const userExists = await this.userModel.findOne({ email: adminData.email });
    if (userExists) {
      throw new ConflictException(`L’email '${adminData.email}' est déjà utilisé.`);
    }

    const company = new this.companyModel(companyData);
    await company.save();

    const hashed = await bcrypt.hash(adminData.password, 10);
    const admin = new this.userModel({
      ...adminData,
      password: hashed,
      role: 'Admin',
      company: company._id,
    });
    await admin.save();

    return { company, admin };
  }

  /** Récupère une company par ID */
  async findOne(id: string): Promise<Company> {
    const company = await this.companyModel.findById(id).lean();
    if (!company) {
      throw new NotFoundException(`Société ${id} introuvable.`);
    }
    return company;
  }

  /** Récupère toutes les companies avec leur Admin */
  async findAll(): Promise<
    Array<Company & { admin: { nom: string; prenom: string; email: string } | null }>
  > {
    const companies = await this.companyModel.find().lean();
    return Promise.all(
      companies.map(async c => {
        const admin = await this.userModel
          .findOne({ company: c._id, role: 'Admin' })
          .lean()
          .select('nom prenom email');
        return {
          ...c,
          admin: admin
            ? { nom: admin.nom, prenom: admin.prenom, email: admin.email }
            : null,
        };
      })
    );
  }

  /** Met à jour partiellement une company */
  async update(id: string, dto: Partial<CreateCompanyDto>): Promise<Company> {
    const updated = await this.companyModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .lean();
    if (!updated) {
      throw new NotFoundException(`Société ${id} introuvable pour mise à jour.`);
    }
    return updated;
  }

  /** Supprime une company */
  async delete(id: string): Promise<void> {
    const result = await this.companyModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Société ${id} introuvable pour suppression.`);
    }
  }
}

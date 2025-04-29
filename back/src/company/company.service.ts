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

  async createWithAdmin(companyData: CreateCompanyDto, adminData: CreateAdminDto) {
    // 1) Vérifier qu'aucune company du même nom n'existe déjà
    const existingCompany = await this.companyModel.findOne({ nom_company: companyData.nom_company });
    if (existingCompany) {
      throw new ConflictException(`L’entreprise '${companyData.nom_company}' existe déjà.`);
    }

    // 2) Vérifier que l’email de l’admin n’est pas déjà utilisé
    const existingUser = await this.userModel.findOne({ email: adminData.email });
    if (existingUser) {
      throw new ConflictException(`L’email '${adminData.email}' est déjà utilisé.`);
    }

    // 3) Création de l’entreprise
    const company = new this.companyModel(companyData);
    await company.save();

    // 4) Hash du mot de passe de l’admin
    const hashed = await bcrypt.hash(adminData.password, 10);

    // 5) Création de l’admin rattaché
    const admin = new this.userModel({
      ...adminData,
      password: hashed,
      role: 'Admin',
      company: company._id,
    });
    await admin.save();

    return { company, admin };
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyModel.findById(id).lean();
    if (!company) {
      throw new NotFoundException(`Société ${id} introuvable.`);
    }
    return company;
  }

  async findAll(): Promise<
    Array<Company & { admin: { nom: string; prenom: string; email: string } | null }>
  > {
    const companies = await this.companyModel.find().lean();
    const result = await Promise.all(
      companies.map(async (c) => {
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
      }),
    );
    return result;
  }
}

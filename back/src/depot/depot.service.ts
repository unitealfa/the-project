// back/src/depot/depot.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { Depot, DepotDocument } from './schemas/depot.schema';
import { CreateDepotDto } from './dto/create-depot.dto';
import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class DepotService {
  constructor(
    @InjectModel(Depot.name) private depotModel: Model<DepotDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(dto: CreateDepotDto, adminId: string): Promise<Depot> {
    const admin = await this.userModel.findById(adminId).lean();
    if (!admin?.company) throw new ForbiddenException('Aucune entreprise associée');

    const { responsable, ...depotPayload } = dto;

    const depot = new this.depotModel({
      ...depotPayload,
      company_id: new Types.ObjectId(admin.company),
    });

    const hashedPwd = await bcrypt.hash(responsable.password, 10);
    const respUser = await this.userModel.create({
      nom: responsable.nom,
      prenom: responsable.prenom,
      email: responsable.email,
      password: hashedPwd,
      num: responsable.num,
      role: 'responsable depot',
      company: new Types.ObjectId(admin.company),
      depot: depot._id,
    });

    depot.responsable_id = respUser._id;
    await depot.save();

    return this.depotModel
      .findById(depot._id)
      .populate('responsable_id', '-password -__v')
      .lean();
  }

  async findAllForCompany(adminId: string): Promise<Depot[]> {
    const admin = await this.userModel.findById(adminId).lean();
    if (!admin?.company) throw new ForbiddenException('Aucune entreprise associée');

    return this.depotModel
      .find({ company_id: admin.company })
      .populate('responsable_id', '-password -__v')
      .lean();
  }

  async findOne(id: string, user: any): Promise<Depot> {
    if (user.role === 'responsable depot') {
      const depot = await this.depotModel
        .findOne({
          _id: new Types.ObjectId(id),
          responsable_id: new Types.ObjectId(user.id),
        })
        .populate('responsable_id', '-password -__v')
        .lean();

      if (!depot) {
        throw new NotFoundException('Dépôt introuvable ou accès interdit');
      }

      return depot;
    }

    const admin = await this.userModel.findById(user.id).lean();
    if (!admin?.company) throw new ForbiddenException('Aucune entreprise associée');

    const depot = await this.depotModel
      .findOne({
        _id: new Types.ObjectId(id),
        company_id: new Types.ObjectId(admin.company),
      })
      .populate('responsable_id', '-password -__v')
      .lean();

    if (!depot) {
      throw new NotFoundException('Dépôt introuvable ou non autorisé');
    }

    return depot;
  }

  async update(id: string, dto: Partial<CreateDepotDto>, adminId: string): Promise<Depot> {
    const admin = await this.userModel.findById(adminId).lean();
    if (!admin?.company) throw new ForbiddenException('Aucune entreprise associée');

    const existingDepot = await this.depotModel
      .findOne({ _id: id, company_id: admin.company })
      .populate('responsable_id')
      .exec();

    if (!existingDepot) throw new NotFoundException('Dépôt introuvable ou non autorisé');

    if (dto.responsable && existingDepot.responsable_id) {
      const update: any = {
        nom: dto.responsable.nom,
        prenom: dto.responsable.prenom,
        email: dto.responsable.email,
        num: dto.responsable.num,
      };

      if (dto.responsable.password && dto.responsable.password.length >= 3) {
        update.password = await bcrypt.hash(dto.responsable.password, 10);
      }

      await this.userModel.findByIdAndUpdate(
        existingDepot.responsable_id._id,
        update,
        { new: true, runValidators: true },
      );
    }

    const { responsable, ...depotData } = dto;

    const updatedDepot = await this.depotModel
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...depotData,
            company_id: existingDepot.company_id,
          },
        },
        { new: true, runValidators: true },
      )
      .populate('responsable_id', '-password -__v')
      .lean();

    return updatedDepot;
  }

  async remove(id: string, adminId: string): Promise<void> {
    const admin = await this.userModel.findById(adminId).lean();
    if (!admin?.company) throw new ForbiddenException('Aucune entreprise associée');

    const depot = await this.depotModel.findOne({
      _id: id,
      company_id: admin.company,
    });

    if (!depot) {
      throw new NotFoundException('Dépôt introuvable ou non autorisé');
    }

    if (depot.responsable_id) {
      await this.userModel.deleteOne({ _id: depot.responsable_id });
    }

    await depot.deleteOne();
  }
}

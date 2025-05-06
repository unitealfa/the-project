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
import { CreateDepotDto }       from './dto/create-depot.dto';
import { User, UserDocument }   from '../user/schemas/user.schema';

@Injectable()
export class DepotService {
  constructor(
    @InjectModel(Depot.name) private depotModel: Model<DepotDocument>,
    @InjectModel(User.name)  private userModel: Model<UserDocument>,
  ) {}

  /** CREATE */
  async create(dto: CreateDepotDto, adminId: string): Promise<Depot> {
    const admin = await this.userModel.findById(adminId).lean();
    if (!admin?.company) throw new ForbiddenException('Aucune entreprise associée');

    const { responsable, ...payload } = dto;
    const depot = new this.depotModel({
      ...payload,
      company_id: new Types.ObjectId(admin.company),
    });

    // création du responsable
    const hashed = await bcrypt.hash(responsable.password, 10);
    const respUser = await this.userModel.create({
      nom:       responsable.nom,
      prenom:    responsable.prenom,
      email:     responsable.email,
      num:       responsable.num,
      password:  hashed,
      role:      'responsable depot',
      company:   admin.company,
      depot:     depot._id,
    });

    depot.responsable_id = respUser._id;
    await depot.save();

    return this.depotModel
      .findById(depot._id)
      .populate('responsable_id', 'nom prenom email num')
      .lean();
  }

  /** LIST ALL */
  async findAllForCompany(adminId: string): Promise<Depot[]> {
    const admin = await this.userModel.findById(adminId).lean();
    if (!admin?.company) throw new ForbiddenException('Aucune entreprise associée');

    return this.depotModel
      .find({ company_id: admin.company })
      .populate('responsable_id', 'nom prenom email num')
      .lean();
  }

  /** GET ONE */
  async findOne(id: string, user: any): Promise<Depot> {
    const objId = new Types.ObjectId(id);

    if (user.role === 'responsable depot') {
      // on autorise uniquement le dépôt associé dans le JWT
      if (user.depot !== id) {
        throw new NotFoundException('Accès interdit ou introuvable');
      }
      const dp = await this.depotModel
        .findById(objId)
        .populate('responsable_id', 'nom prenom email num')
        .lean();
      if (!dp) throw new NotFoundException('Dépôt introuvable');
      return dp;
    }

    // Admin branch
    const admin = await this.userModel.findById(user.id).lean();
    if (!admin?.company) throw new ForbiddenException('Aucune entreprise associée');

    const dp = await this.depotModel
      .findOne({ _id: objId, company_id: admin.company })
      .populate('responsable_id', 'nom prenom email num')
      .lean();
    if (!dp) throw new NotFoundException('Dépôt introuvable');
    return dp;
  }

  /** UPDATE */
  async update(id: string, dto: Partial<CreateDepotDto>, adminId: string): Promise<Depot> {
    const admin = await this.userModel.findById(adminId).lean();
    if (!admin?.company) throw new ForbiddenException('Aucune entreprise associée');

    const existing = await this.depotModel
      .findOne({ _id: id, company_id: admin.company })
      .lean();
    if (!existing) throw new NotFoundException('Dépôt introuvable');

    let responsableId = existing.responsable_id as any;

    if (dto.responsable) {
      const { nom, prenom, email, num, password } = dto.responsable;
      if (existing.responsable_id) {
        const u = await this.userModel.findById(existing.responsable_id);
        if (!u) throw new NotFoundException('Responsable introuvable');
        u.nom = nom;
        u.prenom = prenom;
        u.email = email;
        u.num = num;
        if (password?.length >= 3) u.password = await bcrypt.hash(password, 10);
        await u.save();
        responsableId = u._id;
      } else {
        const hashed = await bcrypt.hash(password, 10);
        const newU = await this.userModel.create({
          nom,
          prenom,
          email,
          num,
          password: hashed,
          role: 'responsable depot',
          company: admin.company,
          depot: new Types.ObjectId(id),
        });
        responsableId = newU._id;
      }
    }

    const set: any = { responsable_id: responsableId };
    if (dto.nom_depot   !== undefined) set.nom_depot   = dto.nom_depot;
    if (dto.type_depot  !== undefined) set.type_depot  = dto.type_depot;
    if (dto.capacite    !== undefined) set.capacite    = dto.capacite;
    if (dto.adresse     !== undefined) set.adresse     = dto.adresse;
    if (dto.coordonnees !== undefined) set.coordonnees = dto.coordonnees;

    const updated = await this.depotModel
      .findByIdAndUpdate(id, { $set: set }, { new: true, runValidators: true })
      .populate('responsable_id', 'nom prenom email num')
      .lean();
    if (!updated) throw new NotFoundException('Erreur mise à jour');
    return updated;
  }

  /** DELETE */
  async remove(id: string, adminId: string): Promise<void> {
    const admin = await this.userModel.findById(adminId).lean();
    if (!admin?.company) throw new ForbiddenException('Aucune entreprise associée');

    const depot = await this.depotModel
      .findOne({ _id: id, company_id: admin.company })
      .lean();
    if (!depot) throw new NotFoundException('Dépôt introuvable');

    if (depot.responsable_id) {
      await this.userModel.deleteOne({ _id: depot.responsable_id });
    }
    await this.depotModel.deleteOne({ _id: id });
  }
}

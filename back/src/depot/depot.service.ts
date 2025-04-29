import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel }                                      from '@nestjs/mongoose';
import { Model, Types }                                     from 'mongoose';

import { Depot, DepotDocument }     from './schemas/depot.schema';
import { CreateDepotDto }           from './dto/create-depot.dto';
import { User, UserDocument }       from '../user/schemas/user.schema';

@Injectable()
export class DepotService {
  constructor(
    @InjectModel(Depot.name) private depotModel: Model<DepotDocument>,
    @InjectModel(User.name)  private userModel:  Model<UserDocument>,
  ) {}

  /**
   * Crée un nouveau dépôt pour l’entreprise de l’admin connecté
   */
  async create(createDto: CreateDepotDto, userId: string): Promise<Depot> {
    const user = await this.userModel.findById(userId).lean();
    if (!user?.company) {
      throw new ForbiddenException('Aucune entreprise associée');
    }

    const depot = new this.depotModel({
      ...createDto,
      // on cast ici au besoin
      company_id: new Types.ObjectId(user.company),
      // date_creation : auto si défini dans le schema
    });

    return depot.save();
  }

  /**
   * Retourne tous les dépôts de l’entreprise de l’admin connecté
   * On récupère tout puis on filtre en JS pour éviter tout problème de type (string vs ObjectId)
   */
  async findAllForCompany(userId: string): Promise<Depot[]> {
    const user = await this.userModel.findById(userId).lean();
    if (!user?.company) {
      throw new ForbiddenException('Aucune entreprise associée');
    }

    // 1) Récupérer tous les dépôts
    const all = await this.depotModel.find().lean();

    // 2) Filtrer en JS par sécurité
    const filtered = all.filter(
      d => d.company_id.toString() === user.company.toString()
    );

    return filtered;
  }

  /**
   * Récupère un dépôt par son ID, en s’assurant qu’il appartient bien à l’entreprise de l’admin
   */
  async findOne(id: string, userId: string): Promise<Depot> {
    const user = await this.userModel.findById(userId).lean();
    if (!user?.company) {
      throw new ForbiddenException('Aucune entreprise associée');
    }

    const all = await this.depotModel.findOne({ _id: id }).lean();
    if (!all || all.company_id.toString() !== user.company.toString()) {
      throw new NotFoundException(`Dépôt ${id} introuvable ou non autorisé`);
    }
    return all;
  }

  /**
   * Met à jour un dépôt (uniquement les champs du DTO), sans écraser company_id
   */
  async update(
    id: string,
    dto: Partial<CreateDepotDto>,
    userId: string,
  ): Promise<Depot> {
    const user = await this.userModel.findById(userId).lean();
    if (!user?.company) {
      throw new ForbiddenException('Aucune entreprise associée');
    }

    // On récupère d'abord pour vérifier appartenance
    const existing = await this.findOne(id, userId);

    // Puis on met à jour
    const updated = await this.depotModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, runValidators: true })
      .lean();

    if (!updated) {
      throw new NotFoundException(`Dépôt ${id} introuvable`);
    }
    return updated;
  }

  /**
   * Supprime un dépôt par son ID, uniquement s’il appartient à l’entreprise de l’admin
   */
  async remove(id: string, userId: string): Promise<void> {
    const user = await this.userModel.findById(userId).lean();
    if (!user?.company) {
      throw new ForbiddenException('Aucune entreprise associée');
    }

    // Vérifie d'abord l’existance + appartenance
    await this.findOne(id, userId);

    await this.depotModel.deleteOne({ _id: id });
  }
}

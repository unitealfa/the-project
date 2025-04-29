import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel }                    from '@nestjs/mongoose';
import { Model, Types }                   from 'mongoose';

import { Depot, DepotDocument }           from './schemas/depot.schema';
import { CreateDepotDto }                 from './dto/create-depot.dto';
import { UserDocument, User }             from '../user/schemas/user.schema';

@Injectable()
export class DepotService {
  constructor(
    @InjectModel(Depot.name) private depotModel: Model<DepotDocument>,
    @InjectModel(User.name)  private userModel:  Model<UserDocument>,
  ) {}

  async create(createDto: CreateDepotDto, userId: string) {
    // Récupère l'utilisateur pour lire sa company
    const user = await this.userModel.findById(userId).lean();
    if (!user || !user.company) {
      throw new ForbiddenException('Aucune entreprise associée');
    }

    const depot = new this.depotModel({
      ...createDto,
      company_id: new Types.ObjectId(user.company),
      // date_creation sera auto via default
    });
    return depot.save();
  }

  async findAllForCompany(userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user || !user.company) {
      throw new ForbiddenException('Aucune entreprise associée');
    }
    return this.depotModel.find({ company_id: user.company }).lean();
  }
}

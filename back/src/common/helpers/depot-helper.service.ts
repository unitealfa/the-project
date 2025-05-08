import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DepotDocument } from '../../depot/schemas/depot.schema';

@Injectable()
export class DepotHelperService {
  constructor(
    @InjectModel('Depot') private readonly depotModel: Model<DepotDocument>,
  ) {}

  async getEntrepriseFromDepot(depotId: Types.ObjectId | string): Promise<Types.ObjectId | null> {
    const depot = await this.depotModel.findById(depotId).lean<{ company_id: Types.ObjectId }>();
    return depot?.company_id ?? null;
  }
}

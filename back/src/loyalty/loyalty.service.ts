import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoyaltyProgram, LoyaltyProgramSchema } from './schemas/program.schema';
import { LoyaltyReward } from './schemas/reward.schema';
import { Company } from '../company/schemas/company.schema';
import { Client } from '../client/schemas/client.schema';
import { CreateTierDto } from './dto/create-tier.dto';

@Injectable()
export class LoyaltyService {
  constructor(
    @InjectModel(LoyaltyProgram.name)
    private programModel: Model<LoyaltyProgram>,
    @InjectModel(LoyaltyReward.name)
    private rewardModel: Model<LoyaltyReward>,
    @InjectModel(Company.name)
    private companyModel: Model<Company>,
    @InjectModel(Client.name)
    private clientModel: Model<Client>,
  ) {}

  async getProgram(companyId: string) {
    return this.programModel.findOne({ company: companyId }).lean();
  }

  async ensureProgram(companyId: string) {
    let prog = await this.programModel.findOne({ company: companyId });
    if (!prog) {
      prog = new this.programModel({ company: companyId });
      await prog.save();
    }
    return prog;
  }

  async setRatio(companyId: string, amount: number, points: number) {
    const prog = await this.ensureProgram(companyId);
    prog.ratio = { amount, points };
    return prog.save();
  }

  async addTier(companyId: string, dto: CreateTierDto) {
    const prog = await this.ensureProgram(companyId);
    prog.tiers.push(dto as any);
    prog.tiers.sort((a, b) => a.points - b.points);
    return prog.save();
  }

  async updateTier(companyId: string, tierId: string, dto: Partial<CreateTierDto>) {
    const prog = await this.ensureProgram(companyId);
    const tier = prog.tiers.find((t: any) => t._id.toString() === tierId);
    if (tier) {
      if (dto.points !== undefined) tier.points = dto.points;
      if (dto.reward !== undefined) tier.reward = dto.reward;
      if (dto.image !== undefined) tier.image = dto.image;
    }
    prog.tiers.sort((a, b) => a.points - b.points);
    return prog.save();
  }

  async removeTier(companyId: string, tierId: string) {
    const prog = await this.ensureProgram(companyId);
    prog.tiers = prog.tiers.filter((t: any) => t._id.toString() !== tierId);
    return prog.save();
  }

  async recordPoints(companyId: string, clientId: string, amount: number) {
    const prog = await this.ensureProgram(companyId);
    const pts = Math.floor(amount / prog.ratio.amount) * prog.ratio.points;
    if (pts <= 0) return 0;
    await this.rewardModel.updateOne(
      { client: clientId, company: companyId, points: pts, delivered: false },
      { $setOnInsert: { client: clientId, company: companyId, points: pts, delivered: false } },
      { upsert: true }
    );
    return pts;
  }

  async listPending(companyId: string) {
    return this.rewardModel
      .find({ company: companyId, delivered: false })
      .populate('client', 'nom_client')
      .lean();
  }

  async deliver(companyId: string, clientId: string, points: number) {
    await this.rewardModel.updateMany({ company: companyId, client: clientId, points, delivered: false }, { delivered: true });
  }

  async deliverAll(companyId: string) {
    await this.rewardModel.updateMany({ company: companyId, delivered: false }, { delivered: true });
  }

  async availableForClient(clientId: string) {
    // 1) Load the client
    const client = await this.clientModel.findById(clientId).lean();
    if (!client) return [];

    // 2) Extract company IDs from their affectations
    const companyIds = (client.affectations || [])
      .map((a: any) => a.entreprise.toString());

    // 3) Find only programs that exist and have at least one tier
    const programs = await this.programModel.find({
      company: { $in: companyIds },
      'tiers.0': { $exists: true } // tiers.0 exists <=> length > 0
    }).lean();

    // 4) Keep the list of "active" company IDs
    const activeIds = programs.map(p => p.company.toString());

    // 5) Load their info (name + pfp)
    const companies = await this.companyModel
      .find({ _id: { $in: activeIds } })
      .lean();

    // 6) Return only this format
    return companies.map(c => ({
      _id:         c._id.toString(),
      nom_company: c.nom_company,
      pfp:         c.pfp,
    }));
  }
}
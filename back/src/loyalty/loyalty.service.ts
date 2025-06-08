import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LoyaltyProgram, LoyaltyProgramSchema } from './schemas/program.schema';
import { LoyaltyReward } from './schemas/reward.schema';
import { Company } from '../company/schemas/company.schema';
import { Client } from '../client/schemas/client.schema';
import { Order } from '../order/schemas/order.schema';
import { Depot } from '../depot/schemas/depot.schema';
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
    @InjectModel(Order.name)
    private orderModel: Model<Order>,
    @InjectModel(Depot.name)
    private depotModel: Model<Depot>,
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
    const prevMax = prog.tiers.length ? prog.tiers[prog.tiers.length - 1].points : 0;
    prog.tiers.push(dto as any);
    prog.tiers.sort((a, b) => a.points - b.points);
     await prog.save();

    // if new tier is higher than previous max, reset baseline for clients
    if (dto.points > prevMax) {
      const clients = await this.clientModel.find({ [`fidelite_points.${companyId}`]: { $exists: true } });
      for (const client of clients) {
        const pts = (client.fidelite_points as any)?.get?.(companyId) || client.fidelite_points?.[companyId] || 0;
        if (!client.loyalty_baseline) client.loyalty_baseline = {} as any;
        client.loyalty_baseline[companyId] = pts;
        await client.save();
      }
    } else {
      // retroactive reward if client already above new tier
      const clients = await this.clientModel.find({ [`fidelite_points.${companyId}`]: { $gte: dto.points } });
      for (const client of clients) {
        const existing = await this.rewardModel.findOne({ client: client._id, company: companyId, points: dto.points });
        if (!existing) {
          await this.rewardModel.create({ client: client._id, company: companyId, points: dto.points, type: 'points', delivered: false });
        }
      }
    }

    return prog;
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

  async recordSpend(companyId: string, clientId: string, amountSpent: number) {
    const prog = await this.ensureProgram(companyId);
    if (!prog.spendReward) return 0;

    const target = prog.spendReward.amount;
    if (target <= 0) return 0;

    const client = await this.clientModel.findById(clientId);
    if (!client) return 0;

    const current = client.spend_since_last_reward?.[companyId] || 0;
    let total = current + amountSpent;
    let rewards = 0;
    while (total >= target) {
      await this.rewardModel.create({
        client: client._id,
        company: new Types.ObjectId(companyId),
        type: 'spend',
        amount: target,
        points: 0,
        delivered: false,
      });
      total -= target;
      rewards += 1;
    }
    client.spend_since_last_reward = {
      ...(client.spend_since_last_reward || {}),
      [companyId]: total,
    };
    await client.save();
    return rewards;
  }

  async getSpendProgress(companyId: string, clientId: string) {
    const prog = await this.ensureProgram(companyId);
    if (!prog.spendReward) return { targetAmount: 0, currentAmount: 0 };
    const client = await this.clientModel.findById(clientId).lean<Client>();
    const current = client?.spend_since_last_reward?.[companyId] || 0;
    return { targetAmount: prog.spendReward.amount, currentAmount: current };
  }

  async getClientData(companyId: string, clientId: string) {
    const prog = await this.ensureProgram(companyId);
    const client = await this.clientModel.findById(clientId).lean<Client>();
    const points = client?.fidelite_points?.[companyId] || 0;
    return { tiers: prog.tiers, points };
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
    const rewards = await this.rewardModel.find({ company: companyId, client: clientId, points, delivered: false }).lean();
    for (const reward of rewards) {
      await this.createRewardOrder(reward);
    }
    await this.rewardModel.updateMany({ company: companyId, client: clientId, points, delivered: false }, { delivered: true });
  }

  async deliverAll(companyId: string) {
    const rewards = await this.rewardModel.find({ company: companyId, delivered: false }).lean();
    for (const reward of rewards) {
      await this.createRewardOrder(reward);
    }
    await this.rewardModel.updateMany({ company: companyId, delivered: false }, { delivered: true });
  }

   private async createRewardOrder(reward: LoyaltyReward) {
    const client = await this.clientModel.findById(reward.client).lean<Client>();
    if (!client) return;

    const lastOrder = await this.orderModel
      .findOne({ clientId: reward.client.toString() })
      .sort({ createdAt: -1 })
      .lean<Order>();

    const depotId = lastOrder?.depot || client.affectations?.[0]?.depot?.toString();
    if (!depotId) return;

    const depot = await this.depotModel.findById(depotId).lean<Depot>();
    const prog = await this.programModel.findOne({ company: reward.company }).lean<LoyaltyProgram>();
    let rewardName = '';
    if (reward.type === 'spend') {
      rewardName = prog?.spendReward?.reward || 'Récompense dépenses';
    } else {
      const tier = prog?.tiers.find(t => t.points === reward.points);
      rewardName = tier?.reward || `Récompense ${reward.points} pts`;
    }

    const order = new this.orderModel({
      clientId: reward.client.toString(),
      nom_client: client.nom_client,
      telephone: client.contact?.telephone || '',
      depot: depotId,
      depot_name: depot?.nom_depot || '',
      adresse_client: {
        adresse: client.localisation?.adresse || '',
        ville: client.localisation?.ville || '',
        code_postal: client.localisation?.code_postal || '',
        region: client.localisation?.region || '',
      },
      items: [
        {
          productId: reward.type === 'spend' ? 'spend-reward' : `reward-${reward.points}`,
          productName: rewardName,
          quantity: 1,
          prix_detail: 0,
        },
      ],
      total: 0,
      confirmed: false,
    });

    await order.save();
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
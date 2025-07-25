import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { LoyaltyProgram, LoyaltyProgramSchema } from "./schemas/program.schema";
import { LoyaltyReward } from "./schemas/reward.schema";
import { Company } from "../company/schemas/company.schema";
import { Client } from "../client/schemas/client.schema";
import { Order } from "../order/schemas/order.schema";
import { Depot } from "../depot/schemas/depot.schema";
import { CreateTierDto } from "./dto/create-tier.dto";

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
    private depotModel: Model<Depot>
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

  private resolveRewardName(r: LoyaltyReward, prog: LoyaltyProgram) {
    if (r.label) return r.label;
    if (r.type === "spend") {
      return prog?.spendReward?.reward || "Récompense dépenses";
    } else if (r.type === "repeat") {
      const rr = prog?.repeatRewards?.find((x) => x.every === r.points);
      return rr?.reward || `Défi ${r.points} pts`;
    } else {
      const tier = prog?.tiers.find((t) => t.points === r.points);
      return tier?.reward || `Récompense ${r.points} pts`;
    }
  }

  private aggregateItems(
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      prix_detail: number;
    }>
  ) {
    const map = new Map<string, (typeof items)[0]>();
    for (const it of items) {
      const key = `${it.productId}::${it.productName}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += it.quantity;
      } else {
        map.set(key, { ...it });
      }
    }
    return Array.from(map.values());
  }

  async setRatio(companyId: string, amount: number, points: number) {
    const prog = await this.ensureProgram(companyId);
    prog.ratio = { amount, points };
    return prog.save();
  }

  async addRepeatReward(
    companyId: string,
    dto: { every: number; reward: string; image?: string }
  ) {
    const prog = await this.ensureProgram(companyId);
    prog.repeatRewards.push(dto as any);
    await prog.save();
    return prog;
  }

  async updateRepeatReward(
    companyId: string,
    rewardId: string,
    dto: Partial<{ every: number; reward: string; image?: string }>
  ) {
    const prog = await this.ensureProgram(companyId);
    const item = (prog.repeatRewards as any).find(
      (r: any) => r._id.toString() === rewardId
    );
    if (item) {
      if (dto.every !== undefined) item.every = dto.every;
      if (dto.reward !== undefined) item.reward = dto.reward;
      if (dto.image !== undefined) item.image = dto.image;
    }
    await prog.save();
    return prog;
  }

  async removeRepeatReward(companyId: string, rewardId: string) {
    const prog = await this.ensureProgram(companyId);
    prog.repeatRewards = (prog.repeatRewards as any).filter(
      (r: any) => r._id.toString() !== rewardId
    );
    await prog.save();
    await this.clientModel.updateMany(
      {},
      {
        $unset: { [`points_since_last_repeat.${rewardId}`]: "" },
      }
    );
    return prog;
  }
  async addTier(companyId: string, dto: CreateTierDto) {
    const prog = await this.ensureProgram(companyId);
    const prevMax = prog.tiers.length
      ? prog.tiers[prog.tiers.length - 1].points
      : 0;
    prog.tiers.push(dto as any);
    prog.tiers.sort((a, b) => a.points - b.points);
    await prog.save();

    // if new tier is higher than previous max, reset baseline for clients
    if (dto.points > prevMax) {
      const clients = await this.clientModel.find({
        [`fidelite_points.${companyId}`]: { $exists: true },
      });
      for (const client of clients) {
        const pts =
          (client.fidelite_points as any)?.get?.(companyId) ||
          client.fidelite_points?.[companyId] ||
          0;
        if (!client.loyalty_baseline) client.loyalty_baseline = {} as any;
        client.loyalty_baseline[companyId] = pts;
        await client.save();
      }
    } else {
      // retroactive reward if client already above new tier
      const clients = await this.clientModel.find({
        [`fidelite_points.${companyId}`]: { $gte: dto.points },
      });
      for (const client of clients) {
        const existing = await this.rewardModel.findOne({
          client: client._id,
          company: companyId,
          points: dto.points,
        });
        if (!existing) {
          await this.rewardModel.create({
            client: client._id,
            company: companyId,
            points: dto.points,
            type: "points",
            delivered: false,
            label: dto.reward,
          });
        }
      }
    }

    return prog;
  }

  async updateTier(
    companyId: string,
    tierId: string,
    dto: Partial<CreateTierDto>
  ) {
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
        type: "spend",
        amount: target,
        points: 0,
        delivered: false,
        label: prog.spendReward?.reward,
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

  async getRepeatRewards(companyId: string) {
    const prog = await this.ensureProgram(companyId);
    return prog.repeatRewards;
  }

  async getRepeatProgress(
    companyId: string,
    clientId: string,
    rewardId: string
  ) {
    const prog = await this.ensureProgram(companyId);
    const reward = (prog.repeatRewards as any).find(
      (r: any) => r._id.toString() === rewardId
    );
    if (!reward) return { every: 0, current: undefined };
    const client = await this.clientModel.findById(clientId).lean<Client>();
    const map: any = client?.points_since_last_repeat;
    const current = map?.get?.(rewardId) ?? map?.[rewardId] ?? 0;
    return { every: reward.every, current };
  }

  async getClientData(companyId: string, clientId: string) {
    const prog = await this.ensureProgram(companyId);
    const client = await this.clientModel.findById(clientId).lean<Client>();
    const points = client?.fidelite_points?.[companyId] || 0;
    return { tiers: prog.tiers, points };
  }

  async recordTierPoints(companyId: string, clientId: string, amount: number) {
    const prog = await this.ensureProgram(companyId);
    const pts = Math.floor(amount / prog.ratio.amount) * prog.ratio.points;
    if (pts <= 0) return 0;
    await this.rewardModel.updateOne(
      { client: clientId, company: companyId, points: pts, delivered: false },
      {
        $setOnInsert: {
          client: clientId,
          company: companyId,
          points: pts,
          delivered: false,
        },
      },
      { upsert: true }
    );
    return pts;
  }

  async recordRepeatReward(
    companyId: string,
    clientId: string,
    ptsEarned: number
  ) {
    const prog = await this.ensureProgram(companyId);
    if (!prog.repeatRewards || prog.repeatRewards.length === 0) return;
    const client = await this.clientModel.findById(clientId);
    if (!client) return;

    for (const r of prog.repeatRewards as any) {
      const id = r._id.toString();
      const map: any = client.points_since_last_repeat;
      const current = (map?.get?.(id) ?? map?.[id] ?? 0) + ptsEarned;
      let remaining = current;
      while (remaining >= r.every) {
        remaining -= r.every;
        await this.rewardModel.create({
          client: client._id,
          company: new Types.ObjectId(companyId),
          type: "repeat",
          points: r.every,
          delivered: false,
          label: r.reward,
        });
      }
      if (!client.points_since_last_repeat) {
        client.points_since_last_repeat = {} as any;
      }
      if (client.points_since_last_repeat instanceof Map) {
        (client.points_since_last_repeat as any).set(id, remaining);
      } else {
        (client.points_since_last_repeat as any)[id] = remaining;
      }
      client.markModified("points_since_last_repeat");
    }
    await client.save();
  }

  async recordRepeatPoints(
    companyId: string,
    clientId: string,
    ptsEarned: number
  ) {
    return this.recordRepeatReward(companyId, clientId, ptsEarned);
  }

  async listPending(companyId: string) {
    const rewards = await this.rewardModel
      .find({ company: companyId, delivered: false })
      .populate("client", "nom_client")
            .lean<LoyaltyReward[]>();

    const prog = await this.programModel
      .findOne({ company: companyId })
      .lean<LoyaltyProgram>();

    return rewards.map((r) => ({
      ...r,
      rewardName: this.resolveRewardName(r as any, prog),
    }));
  }

  async deliver(companyId: string, clientId: string, points: number) {
    const rewards = await this.rewardModel
      .find({ company: companyId, client: clientId, points, delivered: false })
      .lean<LoyaltyReward[]>();

    if (rewards.length === 0) return;

    const prog = await this.programModel
      .findOne({ company: companyId })
      .lean<LoyaltyProgram>();

    const client = await this.clientModel.findById(clientId).lean<Client>();
    if (!client) return;
    const aff = client.affectations?.find(
      (a: any) => a.entreprise.toString() === companyId
    );
    const depotId = aff?.depot?.toString();
    if (!depotId) return;
    const depotDoc = await this.depotModel.findById(depotId).lean<Depot>();

    const rawItems = rewards.map((r) => ({
      productId: r.type === "spend" ? "spend-reward" : `reward-${r.points}`,
      productName: `${client.nom_client} - ${this.resolveRewardName(r, prog)}`,
      quantity: 1,
      prix_detail: 0,
    }));
    const items = this.aggregateItems(rawItems);
    const numero =
      "ALFA-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    await this.orderModel.create({
      clientId: client._id,
      nom_client: client.nom_client,
      telephone: client.contact?.telephone || "",
      depot: depotId,
      depot_name: depotDoc?.nom_depot || "",
      adresse_client: {
        adresse: client.localisation?.adresse || "",
        ville: client.localisation?.ville || "",
        code_postal: client.localisation?.code_postal || "",
        region: client.localisation?.region || "",
      },
      items,
      total: 0,
      confirmed: false,
      numero,
    });

    await this.rewardModel.updateMany(
      { _id: { $in: rewards.map((r) => r._id) } },
      { delivered: true, notified: false }
    );
  }

  async deliverAll(companyId: string) {
    const rewards = await this.rewardModel
      .find({ company: companyId, delivered: false })
      .lean<LoyaltyReward[]>();

    if (rewards.length === 0) return;

    const prog = await this.programModel
      .findOne({ company: companyId })
      .lean<LoyaltyProgram>();

    const rewardsByClient = rewards.reduce<Record<string, LoyaltyReward[]>>(
      (acc, r) => {
        const id = r.client.toString();
        if (!acc[id]) acc[id] = [];
        acc[id].push(r);
        return acc;
      },
      {}
    );

    for (const [clientId, list] of Object.entries(rewardsByClient)) {
      const client = await this.clientModel.findById(clientId).lean<Client>();
      if (!client) continue;
      const aff = client.affectations?.find(
        (a: any) => a.entreprise.toString() === companyId
      );
      const depotId = aff?.depot?.toString();
      if (!depotId) continue;
      const depotDoc = await this.depotModel.findById(depotId).lean<Depot>();

      const rawItems = list.map((r) => ({
        productId: r.type === "spend" ? "spend-reward" : `reward-${r.points}`,
        productName: `${client.nom_client} - ${this.resolveRewardName(
          r,
          prog
        )}`,
        quantity: 1,
        prix_detail: 0,
      }));
      const items = this.aggregateItems(rawItems);

      const numero =
        "ALFA-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
      await this.orderModel.create({
        clientId: client._id,
        nom_client: client.nom_client,
        telephone: client.contact?.telephone || "",
        depot: depotId,
        depot_name: depotDoc?.nom_depot || "",
        adresse_client: {
          adresse: client.localisation?.adresse || "",
          ville: client.localisation?.ville || "",
          code_postal: client.localisation?.code_postal || "",
          region: client.localisation?.region || "",
        },
        items,
        total: 0,
        confirmed: false,
        numero,
      });

      await this.rewardModel.updateMany(
        { _id: { $in: list.map((x) => x._id) } },
        { delivered: true, notified: false }
      );
    }
  }

  async claimPendingRewards(companyId: string, clientId: string) {
    const rewards = await this.rewardModel
      .find({ company: companyId, client: clientId, delivered: false })
      .lean<LoyaltyReward[]>();

    if (rewards.length === 0)
      return [] as Array<{
        productId: string;
        productName: string;
        quantity: number;
        prix_detail: number;
      }>;

    const prog = await this.programModel
      .findOne({ company: companyId })
      .lean<LoyaltyProgram>();

    const client = await this.clientModel.findById(clientId).lean<Client>();
    const clientName = client?.nom_client || "";

    const rawItems = rewards.map((r) => ({
      productId: r.type === "spend" ? "spend-reward" : `reward-${r.points}`,
      productName: `${clientName} - ${this.resolveRewardName(r, prog)}`,
      quantity: 1,
      prix_detail: 0,
    }));
    const items = this.aggregateItems(rawItems);

    await this.rewardModel.updateMany(
      { _id: { $in: rewards.map((x) => x._id) } },
      { delivered: true, notified: false }
    );

    return items;
  }

  async getNewRewardsForClient(clientId: string) {
    const rewards = await this.rewardModel
      .find({ client: clientId, delivered: true, notified: false })
      .lean<LoyaltyReward[]>();
    const result = [] as Array<{ _id: string; name: string }>;
    for (const r of rewards) {
      let name = r.label || "";
      if (!name) {
        const prog = await this.programModel
          .findOne({ company: r.company })
          .lean<LoyaltyProgram>();
        if (r.type === "spend") {
          name = prog?.spendReward?.reward || "Récompense dépenses";
        } else if (r.type === "repeat") {
          const rr = prog?.repeatRewards?.find((x) => x.every === r.points);
          name = rr?.reward || `Défi ${r.points} pts`;
        } else {
          const tier = prog?.tiers.find((t) => t.points === r.points);
          name = tier?.reward || `Récompense ${r.points} pts`;
        }
      }
      result.push({ _id: r._id.toString(), name });
    }
    return result;
  }

  async markRewardsNotified(clientId: string) {
    await this.rewardModel.updateMany(
      { client: clientId, delivered: true, notified: false },
      { notified: true }
    );
  }

  async availableForClient(clientId: string) {
    // 1) Load the client
    const client = await this.clientModel.findById(clientId).lean();
    if (!client) return [];

    // 2) Extract company IDs from their affectations
    const companyIds = (client.affectations || []).map((a: any) =>
      a.entreprise.toString()
    );

    // 3) Find only programs that exist and have at least one tier
    const programs = await this.programModel
      .find({
        company: { $in: companyIds },
        "tiers.0": { $exists: true }, // tiers.0 exists <=> length > 0
      })
      .lean();

    // 4) Keep the list of "active" company IDs
    const activeIds = programs.map((p) => p.company.toString());

    // 5) Load their info (name + pfp)
    const companies = await this.companyModel
      .find({ _id: { $in: activeIds } })
      .lean();

    // 6) Return only this format
    return companies.map((c) => ({
      _id: c._id.toString(),
      nom_company: c.nom_company,
      pfp: c.pfp,
    }));
  }
}

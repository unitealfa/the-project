import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client } from './schemas/client.schema';
import { Model, Types } from 'mongoose';
import { CreateClientDto } from './dto/create-client.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientService {
  constructor(
    @InjectModel('Client') private readonly clientModel: Model<Client>,
  ) {}

  /* ───────────── CRÉATION ───────────── */
  async create(dto: CreateClientDto): Promise<Client> {
    const existing = await this.clientModel.findOne({ email: dto.email });

    const hashed = await bcrypt.hash(dto.password, 10);
    const affectations =
      dto.affectations?.map((a) => ({
        entreprise: new Types.ObjectId(a.entreprise),
        depot: new Types.ObjectId(a.depot),
      })) ?? [];

    if (existing) {
      const newAffectations = affectations.filter(
        (a) =>
          !existing.affectations.some(
            (e) => e.depot.toString() === a.depot.toString(),
          ),
      );
      if (newAffectations.length > 0) {
        existing.affectations.push(...newAffectations);
        return existing.save();
      }
      return existing;
    }

    const created = new this.clientModel({
      ...dto,
      password: hashed,
      affectations,
    });
    return created.save();
  }

  /* ───────────── LECTURE ───────────── */
  async findAll(): Promise<Client[]> {
    return this.clientModel.find().lean();
  }

  async findByDepot(depotId: string): Promise<Client[]> {
    return this.clientModel
      .find({
        $or: [
          { 'affectations.depot': depotId }, // string
          { 'affectations.depot': new Types.ObjectId(depotId) }, // ObjectId
        ],
      })
      .lean();
  }

  async findById(id: string): Promise<Client | null> {
    return this.clientModel.findById(id).lean();
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.clientModel.findOne({ email }).lean();
  }

  /* ───────────── AFFECTATION ───────────── */
  async addAffectation(
    clientId: string,
    entrepriseId: string,
    depotId: string,
  ) {
    const client = await this.clientModel.findById(clientId);
    if (!client) return null;

    const exists = client.affectations.some(
      (a) => a.depot.toString() === depotId,
    );
    if (exists) {
      throw new Error('Ce client est déjà affecté à ce dépôt.');
    }

    client.affectations.push({
      entreprise: new Types.ObjectId(entrepriseId),
      depot: new Types.ObjectId(depotId),
    });

    return client.save();
  }

  /* ───────────── MISE À JOUR ───────────── */
  async update(id: string, dto: Partial<CreateClientDto>) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }
    return this.clientModel.findByIdAndUpdate(id, dto, { new: true }).lean();
  }

  /* ───────────── SUPPRESSION ───────────── */
  async delete(id: string) {
    return this.clientModel.findByIdAndDelete(id).lean();
  }
}

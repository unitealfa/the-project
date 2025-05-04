import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Client } from "./schemas/client.schema";
import { Model, Types } from "mongoose";
import { CreateClientDto } from "./dto/create-client.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class ClientService {
  constructor(
    @InjectModel("Client") private readonly clientModel: Model<Client>
  ) {}

  async create(dto: CreateClientDto): Promise<Client> {
    const hashed = await bcrypt.hash(dto.password, 10);

    const depotObjectId = dto.depot
      ? new Types.ObjectId(dto.depot) // 🔁 conversion en ObjectId si fourni
      : undefined;

    const created = new this.clientModel({
      ...dto,
      password: hashed,
      depot: depotObjectId, // 👈 applique le ObjectId ici
    });

    return created.save();
  }

  async findAll(): Promise<Client[]> {
    return this.clientModel.find().lean();
  }

  async findByDepot(depotId: string): Promise<Client[]> {
    return this.clientModel
      .find({ depot: new Types.ObjectId(depotId) })
      .lean();
  }

  async findById(id: string): Promise<Client | null> {
    return this.clientModel.findById(id).lean();
  }

  async update(id: string, dto: Partial<CreateClientDto>) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    if (dto.depot && typeof dto.depot === "string") {
      dto.depot = new Types.ObjectId(dto.depot);
    }

    return this.clientModel.findByIdAndUpdate(id, dto, { new: true }).lean();
  }

  async delete(id: string) {
    return this.clientModel.findByIdAndDelete(id).lean();
  }
}

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import * as bcrypt from "bcrypt";

import { Depot, DepotDocument } from "../depot/schemas/depot.schema";
import { User, UserDocument } from "../user/schemas/user.schema";
import { Client } from "../client/schemas/client.schema";
import { CreateMemberDto, UpdateMemberDto } from "./dto/create-member.dto";

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Depot.name) private readonly depotModel: Model<DepotDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>
  ) {}

  async listPrevendeursForSuperviseur(depotId: string) {
    const oid = new Types.ObjectId(depotId);

    // Récupérer les prévendeurs et superviseurs des ventes du dépôt
    const prevendeurs = await this.userModel
      .find({
        depot: oid,
        role: { $in: ["Pré-vendeur", "Superviseur des ventes"] },
        poste: "Prévente",
      })
      .select("-password")
      .lean();

    return { prevente: prevendeurs };
  }

  async listByDepot(
    depotId: string,
    userId: string,
    poste?: "Livraison" | "Prévente" | "Entrepôt"
  ) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException("Utilisateur introuvable");

    await this.guardDepot(depotId, userId);
    const oid = new Types.ObjectId(depotId);

    // Filtre sur `poste` (catégorie)
    const fetch = (cat: string) =>
      this.userModel
        .find({ depot: oid, poste: cat })
        .select("-password")
        .lean();

    if (poste) {
      const arr = await fetch(poste);
      return { [poste.toLowerCase()]: arr };
    }

    const [livraison, prevente, entrepot] = await Promise.all([
      fetch("Livraison"),
      fetch("Prévente"),
      fetch("Entrepôt"),
    ]);
    return { livraison, prevente, entrepot };
  }

  async addMember(depotId: string, dto: CreateMemberDto, userId: string) {
    const depot = await this.guardDepot(depotId, userId);

    if (
      (await this.userModel.exists({ email: dto.email })) ||
      (await this.clientModel.exists({ email: dto.email }))
    )
      throw new ConflictException("Email déjà utilisé");

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = new this.userModel({
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      num: dto.num,
      password: hashed,
      role: dto.role,
      poste: dto.poste,
      company: depot.company_id,
      depot: new Types.ObjectId(depotId),
      pfp: dto.pfp || "images/default-user.webp",
    });
    await user.save();

    const { password, ...safe } = user.toObject();
    return safe;
  }

  async removeMember(memberId: string, adminId: string) {
    const member = await this.userModel.findById(memberId).lean();
    if (!member) throw new NotFoundException("Membre introuvable");

    await this.guardDepot(member.depot.toString(), adminId);
    await this.userModel.deleteOne({ _id: memberId });
    return { deleted: true };
  }

  private async guardDepot(depotId: string, userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new ForbiddenException("Utilisateur non trouvé");

    if (user.role === "Admin") {
      if (!user.company)
        throw new ForbiddenException("Pas de société associée");
      const depot = await this.depotModel.findById(depotId).lean();
      if (!depot || depot.company_id.toString() !== user.company.toString())
        throw new ForbiddenException("Accès refusé");
      return depot;
    }

    if (user.role === "responsable depot") {
      const depot = await this.depotModel
        .findOne({ _id: depotId, responsable_id: user._id })
        .lean();
      if (!depot) throw new ForbiddenException("Accès refusé");
      return depot;
    }

    throw new ForbiddenException("Rôle non autorisé");
  }

  async findOneMember(memberId: string, userId: string) {
    const member = await this.userModel
      .findById(memberId)
      .select("-password")
      .lean();
    if (!member) throw new NotFoundException("Membre introuvable");
    // Ensure the requesting user has access to this member's depot
    await this.guardDepot(member.depot.toString(), userId);
    return member;
  }

  async updateMember(memberId: string, dto: UpdateMemberDto, userId: string) {
    const member = await this.userModel.findById(memberId);
    if (!member) throw new NotFoundException("Membre introuvable");

    // Ensure the requesting user has access to this member's depot
    await this.guardDepot(member.depot.toString(), userId);

    if (dto.email && dto.email !== member.email) {
      const existsUser = await this.userModel.exists({ email: dto.email });
      const existsClient = await this.clientModel.exists({ email: dto.email });
      if (existsUser || existsClient) {
        throw new ConflictException("Email déjà utilisé");
      }
    }

    if (dto.password && dto.password.length >= 3) {
      dto.password = await bcrypt.hash(dto.password, 10);
    } else {
      delete dto.password;
    }

    Object.assign(member, dto);
    await member.save();

    const { password, ...safe } = member.toObject();
    return safe;
  }

  async updateOwnPfp(memberId: string, pfpPath: string) {
    const member = await this.userModel.findById(memberId);
    if (!member) throw new NotFoundException("Membre introuvable");
    member.pfp = pfpPath;
    await member.save();
    const { password, ...safe } = member.toObject();
    return safe;
  }

  async updateMemberPfp(memberId: string, pfpPath: string, adminId: string) {
    const member = await this.userModel.findById(memberId);
    if (!member) throw new NotFoundException("Membre introuvable");

    await this.guardDepot(member.depot.toString(), adminId);

    member.pfp = pfpPath;
    await member.save();

    const { password, ...safe } = member.toObject();
    return safe;
  }
}

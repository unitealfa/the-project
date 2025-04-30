// back/src/team/team.service.ts
import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

import {
  Depot,
  DepotDocument,
} from '../depot/schemas/depot.schema';
import {
  User,
  UserDocument,
} from '../user/schemas/user.schema';
import { CreateMemberDto } from './dto/create-member.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Depot.name) private readonly depotModel: Model<DepotDocument>,
    @InjectModel(User.name)  private readonly userModel : Model<UserDocument>,
  ) {}

  /* ───────────────────────── LISTE ───────────────────────── */
  async listByDepot(
    depotId : string,
    adminId : string,
    role?   : 'livraison' | 'prevente' | 'entrepot',   // query facultative
  ) {
    await this.guardDepot(depotId, adminId);

    const oid = new Types.ObjectId(depotId);          // ✅ conversion

    const fetch = (r: string) =>
      this.userModel
        .find({ depot: oid, role: r })
        .select('-password')
        .lean();

    if (role) {
      const arr = await fetch(role);
      return { [role]: arr };                         // ex. { livraison:[…] }
    }

    const [livraison, prevente, entrepot] = await Promise.all([
      fetch('livraison'),
      fetch('prevente'),
      fetch('entrepot'),
    ]);

    return { livraison, prevente, entrepot };
  }

  /* ──────────────────────── AJOUT ────────────────────────── */
  async addMember(
    depotId : string,
    dto     : CreateMemberDto,
    adminId : string,
  ) {
    const depot = await this.guardDepot(depotId, adminId);

    if (await this.userModel.exists({ email: dto.email }))
      throw new ConflictException('Email déjà utilisé');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = new this.userModel({
      nom      : dto.nom,
      prenom   : dto.prenom,
      email    : dto.email,
      num      : dto.num,
      password : hashed,
      role     : dto.role,          // livraison | prevente | entrepot
      fonction : dto.fonction,      // ex. “Pré-vendeur”
      company  : depot.company_id,
      depot    : new Types.ObjectId(depotId),
    });

    await user.save();
    const { password, ...safe } = user.toObject();
    return safe;                                   // mot de passe exclu
  }

  /* ───────────────────── SUPPRESSION ─────────────────────── */
  async removeMember(memberId: string, adminId: string) {
    const member = await this.userModel.findById(memberId).lean();
    if (!member) throw new NotFoundException('Membre introuvable');

    await this.guardDepot(member.depot.toString(), adminId);
    await this.userModel.deleteOne({ _id: memberId });
    return { deleted: true };
  }

  /* ─────────── Vérifie l’accès à un dépôt ────────── */
  private async guardDepot(depotId: string, adminId: string) {
    const admin = await this.userModel.findById(adminId).lean();
    if (!admin?.company)
      throw new ForbiddenException('Pas de société associée');

    const depot = await this.depotModel.findById(depotId).lean();
    if (!depot || depot.company_id.toString() !== admin.company.toString())
      throw new ForbiddenException('Accès refusé');

    return depot;
  }
}

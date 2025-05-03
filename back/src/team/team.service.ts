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
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async listByDepot(
    depotId: string,
    userId: string,
    role?: 'livraison' | 'prevente' | 'entrepot',
  ) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const oid = new Types.ObjectId(depotId);

    const fetch = (r: string) =>
      this.userModel
        .find({ depot: oid, role: r })
        .select('-password')
        .lean();

    if (user.role === 'responsable depot') {
      if (user.depot?.toString() !== depotId)
        throw new ForbiddenException('Ce dépôt ne vous appartient pas');

      const [livraison, prevente, entrepot] = await Promise.all([
        fetch('livraison'),
        fetch('prevente'),
        fetch('entrepot'),
      ]);

      if (role) {
        return { [role]: role === 'livraison' ? livraison : role === 'prevente' ? prevente : entrepot };
      }

      return { livraison, prevente, entrepot };
    }

    await this.guardDepot(depotId, userId);

    if (role) {
      const arr = await fetch(role);
      return { [role]: arr };
    }

    const [livraison, prevente, entrepot] = await Promise.all([
      fetch('livraison'),
      fetch('prevente'),
      fetch('entrepot'),
    ]);

    return { livraison, prevente, entrepot };
  }

  async addMember(
    depotId: string,
    dto: CreateMemberDto,
    userId: string,
  ) {
    const depot = await this.guardDepot(depotId, userId);

    if (await this.userModel.exists({ email: dto.email }))
      throw new ConflictException('Email déjà utilisé');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = new this.userModel({
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      num: dto.num,
      password: hashed,
      role: dto.role,
      fonction: dto.fonction,
      company: depot.company_id,
      depot: new Types.ObjectId(depotId),
    });

    await user.save();
    const { password, ...safe } = user.toObject();
    return safe;
  }

  async removeMember(memberId: string, adminId: string) {
    const member = await this.userModel.findById(memberId).lean();
    if (!member) throw new NotFoundException('Membre introuvable');

    await this.guardDepot(member.depot.toString(), adminId);
    await this.userModel.deleteOne({ _id: memberId });
    return { deleted: true };
  }

  private async guardDepot(depotId: string, userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new ForbiddenException('Utilisateur non trouvé');

    if (user.role === 'Admin') {
      if (!user.company) throw new ForbiddenException('Pas de société associée');
      const depot = await this.depotModel.findById(depotId).lean();
      if (!depot || depot.company_id.toString() !== user.company.toString())
        throw new ForbiddenException('Accès refusé');
      return depot;
    }

    if (user.role === 'responsable depot') {
      const depot = await this.depotModel.findOne({
        _id: depotId,
        responsable_id: user._id,
      }).lean();

      if (!depot) throw new ForbiddenException('Accès refusé');
      return depot;
    }

    throw new ForbiddenException('Rôle non autorisé');
  }
}

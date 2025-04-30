import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Depot,  DepotDocument }   from '../depot/schemas/depot.schema';
import { Member, MemberDocument }  from './schemas/member.schema';
import { User,   UserDocument }    from '../user/schemas/user.schema';
import { CreateMemberDto }         from './dto/create-member.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Depot.name)   private depotModel : Model<DepotDocument>,
    @InjectModel(Member.name)  private memberModel: Model<MemberDocument>,
    @InjectModel(User.name)    private userModel  : Model<UserDocument>,
  ) {}

  /** liste les membres par rôle pour un dépôt */
  async listByDepot(depotId: string, userId: string) {
    await this.assertDepotAccessible(depotId, userId);

    const [livraison, prevente, entrepot] = await Promise.all([
      this.memberModel.find({ depotId, role: 'livraison' }).lean(),
      this.memberModel.find({ depotId, role: 'prevente'  }).lean(),
      this.memberModel.find({ depotId, role: 'entrepot'  }).lean(),
    ]);

    return { livraison, prevente, entrepot };
  }

  /** ajoute un membre dans le dépôt */
  async addMember(depotId: string, dto: CreateMemberDto, userId: string) {
    await this.assertDepotAccessible(depotId, userId);

    const member = new this.memberModel({
      depotId: new Types.ObjectId(depotId),
      role   : dto.role,
      nom    : dto.nom,
      prenom : dto.prenom,
    });
    return member.save();
  }

  /** supprime un membre */
  async removeMember(memberId: string, userId: string) {
    const member = await this.memberModel.findById(memberId).lean();
    if (!member) throw new NotFoundException('Membre introuvable');

    await this.assertDepotAccessible(member.depotId.toString(), userId);
    await this.memberModel.deleteOne({ _id: memberId });
    return { deleted: true };
  }

  /** vérifie que le dépôt appartient bien à la company de l’admin */
  private async assertDepotAccessible(depotId: string, userId: string) {
    const user = await this.userModel.findById(userId).lean();
    if (!user?.company) {
      throw new ForbiddenException('Aucune entreprise associée');
    }
    const depot = await this.depotModel.findById(depotId).lean();
    if (!depot || depot.company_id.toString() !== user.company.toString()) {
      throw new ForbiddenException('Accès refusé à ce dépôt');
    }
  }
}

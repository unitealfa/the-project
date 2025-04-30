import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import * as bcrypt from 'bcrypt'

import { Depot, DepotDocument } from '../depot/schemas/depot.schema'
import { User, UserDocument }   from '../user/schemas/user.schema'
import { CreateMemberDto }      from './dto/create-member.dto'

@Injectable()
export class TeamService {
  constructor(
    @InjectModel(Depot.name) private depotModel: Model<DepotDocument>,
    @InjectModel(User.name)  private userModel : Model<UserDocument>,
  ) {}

  /* ───────── LISTE PAR DÉPÔT ───────── */
  async listByDepot(depotId: string, adminId: string) {
    await this.guardDepot(depotId, adminId)

    const users = await this.userModel
      .find({
        depot : new Types.ObjectId(depotId),   // ← on matche bien le champ depot
        role  : 'livraison',
      })
      .select('-password')
      .lean()

    return { livraison: users }                // autres équipes à venir
  }

  /* ───────── AJOUT MEMBRE ───────── */
  async addMember(depotId: string, dto: CreateMemberDto, adminId: string) {
    const depot = await this.guardDepot(depotId, adminId)

    /* email déjà pris ? */
    if (await this.userModel.exists({ email: dto.email }))
      throw new ConflictException('Email déjà utilisé')

    const hashed = await bcrypt.hash(dto.password, 10)

    const user = new this.userModel({
      nom      : dto.nom,
      prenom   : dto.prenom,
      email    : dto.email,
      num      : dto.num,
      password : hashed,
      role     : dto.role,       // ex. « livraison »
      fonction : dto.fonction,   // ex. « Livreur »
      company  : depot.company_id,
      depot    : new Types.ObjectId(depotId),
    })

    await user.save()
    const { password, ...safe } = user.toObject()
    return safe
  }

  /* ───────── SUPPRESSION MEMBRE ───────── */
  async removeMember(memberId: string, adminId: string) {
    const member = await this.userModel.findById(memberId).lean()
    if (!member) throw new NotFoundException('Membre introuvable')

    await this.guardDepot(member.depot.toString(), adminId)
    await this.userModel.deleteOne({ _id: memberId })
    return { deleted: true }
  }

  /* ───────── SÉCURITÉ ── l’admin a-t-il accès au dépôt ? ───────── */
  private async guardDepot(depotId: string, adminId: string) {
    const admin = await this.userModel.findById(adminId).lean()
    if (!admin?.company) throw new ForbiddenException('Pas de société associée')

    const depot = await this.depotModel.findById(depotId).lean()
    if (!depot || depot.company_id.toString() !== admin.company.toString())
      throw new ForbiddenException('Accès refusé')

    return depot
  }
}

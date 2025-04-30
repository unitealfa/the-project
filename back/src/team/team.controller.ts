// back/src/team/team.controller.ts
import {
  Controller, Get, Post, Delete,
  Param, Body, Req, Query,
  UseGuards, Logger, BadRequestException,
} from '@nestjs/common'

import { JwtAuthGuard }    from '../auth/jwt-auth.guard'
import { RolesGuard }      from '../auth/roles.guard'
import { Roles }           from '../auth/roles.decorator'

import { TeamService }     from './team.service'
import { CreateMemberDto } from './dto/create-member.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamController {
  private readonly logger = new Logger(TeamController.name)

  constructor (private readonly svc: TeamService) {}

  /* ───────── LISTE ─────────────────────────────────────────── */
  @Roles('Admin')
  @Get(':depotId')
  async list (
    @Param('depotId') depotId: string,
    @Req()            req: any,
    @Query('role')    role?: 'livraison'|'prevente'|'entrepot',
  ) {
    this.logger.log(`Admin ${req.user.id} - list depot ${depotId}`)
    const data = await this.svc.listByDepot(depotId, req.user.id)
    return role ? (data as any)[role] ?? [] : data
  }

  /* ───────── AJOUT ─────────────────────────────────────────── */
  @Roles('Admin')
  @Post(':depotId/members')
  async addMember (
    @Param('depotId') depotId: string,
    @Body()           dto: CreateMemberDto,
    @Req()            req: any,
  ) {
    try {
      this.logger.log(`Admin ${req.user.id} - add member to ${depotId}`)
      return await this.svc.addMember(depotId, dto, req.user.id)
    } catch (e: any) {
      this.logger.error('addMember failed', e.stack || e.message)
      throw new BadRequestException(e.message)
    }
  }

  /* ───────── SUPPR ─────────────────────────────────────────── */
  @Roles('Admin')
  @Delete('members/:memberId')
  async remove (
    @Param('memberId') memberId: string,
    @Req()             req: any,
  ) {
    this.logger.log(`Admin ${req.user.id} - delete member ${memberId}`)
    await this.svc.removeMember(memberId, req.user.id)
    return { deleted:true }
  }
}

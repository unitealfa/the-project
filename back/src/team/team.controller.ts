// back/src/team/team.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';

import { JwtAuthGuard }      from '../auth/jwt-auth.guard';
import { RolesGuard }        from '../auth/roles.guard';
import { Roles }             from '../auth/roles.decorator';

import { TeamService }       from './team.service';
import { CreateMemberDto }   from './dto/create-member.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamController {
  private readonly logger = new Logger(TeamController.name);

  constructor(private readonly svc: TeamService) {}

  /* ────────────────────────────────────────────────────────────
     Récupérer les membres d’un dépôt  (Admin uniquement)
     GET /teams/:depotId   → { livraison:[], prevente:[], entrepot:[] }
  ──────────────────────────────────────────────────────────── */
  @Roles('Admin')
  @Get(':depotId')
  async list(@Param('depotId') depotId: string, @Req() req: any) {
    this.logger.log(`Admin ${req.user.id} demande la liste des équipes du dépôt ${depotId}`);
    return this.svc.listByDepot(depotId, req.user.id);
  }

  /* ────────────────────────────────────────────────────────────
     Ajouter un membre à un dépôt
     POST /teams/:depotId/members   body = { role, nom, prenom }
  ──────────────────────────────────────────────────────────── */
  @Roles('Admin')
  @Post(':depotId/members')
  async addMember(
    @Param('depotId') depotId: string,
    @Body() dto: CreateMemberDto,
    @Req() req: any,
  ) {
    try {
      this.logger.log(`Admin ${req.user.id} ajoute un membre au dépôt ${depotId}`);
      return await this.svc.addMember(depotId, dto, req.user.id);
    } catch (e) {
      this.logger.error('Erreur addMember', e.stack || e.message);
      throw new BadRequestException(e.message);
    }
  }

  /* ────────────────────────────────────────────────────────────
     Supprimer un membre
     DELETE /teams/members/:memberId
  ──────────────────────────────────────────────────────────── */
  @Roles('Admin')
  @Delete('members/:memberId')
  async remove(@Param('memberId') memberId: string, @Req() req: any) {
    this.logger.log(`Admin ${req.user.id} supprime le membre ${memberId}`);
    await this.svc.removeMember(memberId, req.user.id);
    return { deleted: true };
  }
}

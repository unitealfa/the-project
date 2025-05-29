import {
  Controller, Get, Post, Put, Delete, Param, Body, Req, Query,
  UseGuards, Logger, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TeamService } from './team.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/create-member.dto';


@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/teams')
export class TeamController {
  private readonly logger = new Logger(TeamController.name);

  constructor(private readonly svc: TeamService) {}

  /** Pour le responsable : toute son équipe (toutes catégories) */
  @Roles('responsable depot')
  @Get('mine')
  async getMyTeam(@Req() req: any) {
    const depotId = req.user.depot;
    if (!depotId) throw new ForbiddenException('Aucun dépôt assigné');
    this.logger.log(`Responsable ${req.user.id} consulte son équipe`);
    return this.svc.listByDepot(depotId, req.user.id);
  }

  /** Liste des prévendeurs pour un superviseur des ventes */
  @Roles('Superviseur des ventes')
  @Get('prevente/:depotId')
  async listPrevendeurs(
    @Param('depotId') depotId: string,
    @Req() req: any,
  ) {
    // Vérifier que le superviseur appartient bien à ce dépôt
    if (req.user.depot !== depotId) {
      throw new ForbiddenException('Vous n\'avez pas accès à ce dépôt');
    }
    
    this.logger.log(`Superviseur ${req.user.id} liste les prévendeurs du dépôt ${depotId}`);
    return this.svc.listPrevendeursForSuperviseur(depotId);
  }

  /** Liste par dépôt, filtre sur `poste` (catégorie) */
  @Roles('Admin', 'responsable depot')
  @Get(':depotId')
  async list(
    @Param('depotId') depotId: string,
    @Req() req: any,
    @Query('poste') poste?: 'Livraison' | 'Prévente' | 'Entrepôt',
  ) {
    this.logger.log(`${req.user.role} ${req.user.id} liste ${poste ?? 'ALL'} pour dépôt ${depotId}`);
    return this.svc.listByDepot(depotId, req.user.id, poste);
  }

  /** Récupérer un membre spécifique */
  @Roles('Admin', 'responsable depot')
  @Get('members/:memberId')
  async getMember(@Param('memberId') memberId: string, @Req() req: any) {
    this.logger.log(`${req.user.role} ${req.user.id} consulte le membre ${memberId}`);
    return this.svc.findOneMember(memberId, req.user.id);
  }

  /** Ajout d'un membre */
  @Roles('Admin', 'responsable depot')
  @Post(':depotId/members')
  async addMember(
    @Param('depotId') depotId: string,
    @Body() dto: CreateMemberDto,
    @Req() req: any,
  ) {
    try {
      this.logger.log(`${req.user.role} ${req.user.id} - add member to ${depotId}`);
      return await this.svc.addMember(depotId, dto, req.user.id);
    } catch (e: any) {
      this.logger.error('addMember failed', e.stack || e.message);
      throw new BadRequestException(e.message);
    }
  }

  /** Mise à jour d'un membre */
  @Roles('Admin', 'responsable depot')
  @Put('members/:memberId')
  async updateMember(
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
    @Req() req: any,
  ) {
    try {
      this.logger.log(`${req.user.role} ${req.user.id} met à jour le membre ${memberId}`);
      return await this.svc.updateMember(memberId, dto, req.user.id);
    } catch (e: any) {
      this.logger.error('updateMember failed', e.stack || e.message);
      throw new BadRequestException(e.message);
    }
  }

  /** Suppression d'un membre */
  @Roles('Admin', 'responsable depot')
  @Delete('members/:memberId')
  async remove(@Param('memberId') memberId: string, @Req() req: any) {
    this.logger.log(`${req.user.role} ${req.user.id} - delete member ${memberId}`);
    await this.svc.removeMember(memberId, req.user.id);
    return { deleted: true };
  }
}

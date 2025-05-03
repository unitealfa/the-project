import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  Query,
  UseGuards,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { TeamService } from './team.service';
import { CreateMemberDto } from './dto/create-member.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teams')
export class TeamController {
  private readonly logger = new Logger(TeamController.name);

  constructor(private readonly svc: TeamService) {}

  /** Pour le responsable de dépôt : son équipe uniquement */
  @Roles('responsable depot')
  @Get('mine')
  async getMyTeam(@Req() req: any) {
    const depotId = req.user.depot;
    if (!depotId) {
      throw new ForbiddenException('Aucun dépôt assigné');
    }
    this.logger.log(`Responsable ${req.user.id} consulte son équipe`);
    return this.svc.listByDepot(depotId, req.user.id);
  }

  /** Liste par dépôt */
  @Roles('Admin', 'responsable depot')
  @Get(':depotId')
  async list(
    @Param('depotId') depotId: string,
    @Req() req: any,
    @Query('role') role?: 'livraison' | 'prevente' | 'entrepot',
  ) {
    this.logger.log(`${req.user.role} ${req.user.id} liste ${role ?? 'ALL'} pour dépôt ${depotId}`);
    return this.svc.listByDepot(depotId, req.user.id, role);
  }

  /** Ajout d’un membre */
  @Roles('Admin', 'responsable depot') // ✅ permet au responsable de créer aussi
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

  /** Suppression d’un membre */
  @Roles('Admin')
  @Delete('members/:memberId')
  async remove(@Param('memberId') memberId: string, @Req() req: any) {
    this.logger.log(`Admin ${req.user.id} - delete member ${memberId}`);
    await this.svc.removeMember(memberId, req.user.id);
    return { deleted: true };
  }
}

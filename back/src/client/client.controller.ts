import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  Put,
  Delete,
  NotFoundException,
  Logger,            // ← logger
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DepotHelperService } from '../common/helpers/depot-helper.service';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientController {
  private readonly logger = new Logger(ClientController.name);

  constructor(
    private readonly clientService: ClientService,
    private readonly depotHelper: DepotHelperService,
  ) {}

  /* ───────────────────────── CHECK EMAIL ───────────────────────── */
  @Get('check')
  @Roles('Admin', 'responsable depot')
  async checkClient(@Query('email') email: string) {
    this.logger.debug(`GET /clients/check?email=${email}`);
    return this.clientService.findByEmail(email);
  }

  /* ───────────────────────── LISTE DES CLIENTS ───────────────────────── */

  @Get()
  @Roles('Admin', 'responsable depot', 'superviseur des ventes', 'Administrateur des ventes', 'Pré-vendeur')
  async getClients(@Req() req, @Query('depot') depotId?: string) {
    const user = req.user;
    this.logger.debug(`GET /clients – role=${user.role} depotQuery=${depotId ?? '∅'}`);

    // responsables / superviseurs / admin-ventes / prévendeurs ⇒ uniquement leur dépôt
    if (
      user.role === 'responsable depot' ||
      user.role === 'superviseur des ventes' ||
      user.role === 'Administrateur des ventes' ||
      user.role === 'Pré-vendeur'
    ) {
      this.logger.debug(` → findByDepot(${user.depot})`);
      return this.clientService.findByDepot(user.depot);
    }

    // Admin
    if (depotId) {
      this.logger.debug(` → Admin + filtrage depot ${depotId}`);
      return this.clientService.findByDepot(depotId);
    }
    this.logger.debug(' → Admin – all clients');
    return this.clientService.findAll();
  }

  /* ──────────────────────── GET CLIENT PAR ID ──────────────────────── */

  @Get(':id')
  @Roles('Admin', 'responsable depot', 'superviseur des ventes', 'Administrateur des ventes', 'Pré-vendeur')
  async getClientById(@Param('id') id: string) {
    this.logger.debug(`GET /clients/${id}`);
    const client = await this.clientService.findById(id);
    if (!client) {
      this.logger.warn(`Client ${id} introuvable`);
      throw new NotFoundException(`Client ${id} introuvable`);
    }
    return client;
  }

  /* ───────────────────────── AFFECTATION ───────────────────────── */

  @Post(':id/affectation')
  @Roles('responsable depot')
  async addAffectation(
    @Param('id') id: string,
    @Body() body: { entreprise: string; depot: string },
  ) {
    this.logger.debug(`POST /clients/${id}/affectation – body=${JSON.stringify(body)}`);
    return this.clientService.addAffectation(id, body.entreprise, body.depot);
  }

  /* ───────────────────────── CRÉATION ───────────────────────── */

  @Post()
  @Roles('responsable depot')
  async createClient(@Body() dto: CreateClientDto, @Req() req) {
    const user = req.user;
    this.logger.debug(`POST /clients – user=${user.role}`);

    if (user.role === 'responsable depot') {
      const entrepriseId = await this.depotHelper.getEntrepriseFromDepot(user.depot);
      if (!entrepriseId) throw new Error('Entreprise introuvable pour ce dépôt.');

      dto.affectations = [
        { entreprise: entrepriseId.toString(), depot: user.depot.toString() },
      ];
    }
    return this.clientService.create(dto);
  }

  /* ───────────────────────── UPDATE / DELETE ───────────────────────── */

  @Put(':id')
  @Roles('responsable depot')
  async updateClient(@Param('id') id: string, @Body() dto: Partial<CreateClientDto>) {
    this.logger.debug(`PUT /clients/${id} – body=${JSON.stringify(dto)}`);
    return this.clientService.update(id, dto);
  }

  @Delete(':id')
  @Roles('responsable depot')
  async deleteClient(@Param('id') id: string, @Req() req) {
    const user = req.user; // JwtAuthGuard met user.depot
    this.logger.debug(`DELETE /clients/${id} (soft delete from depot=${user.depot})`);
    return this.clientService.removeAffectation(id, user.depot);
  }
}

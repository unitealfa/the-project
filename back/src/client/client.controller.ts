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
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  // 🔍 Récupérer les clients selon le rôle ou un dépôt spécifique
  @Get()
  @Roles('Admin', 'responsable depot')
  async getClients(@Req() req, @Query('depot') depotId?: string) {
    const user = req.user;

    if (user.role === 'responsable depot') {
      return this.clientService.findByDepot(user.depot);
    }

    return depotId
      ? this.clientService.findByDepot(depotId)
      : this.clientService.findAll();
  }

  // 🔎 Vérifier si un client existe par email
  @Get('check')
  @Roles('Admin', 'responsable depot')
  async checkClient(@Query('email') email: string) {
    return this.clientService.findByEmail(email);
  }

  // ➕ Affecter un client existant à un nouveau dépôt/entreprise (sans doublon)
  @Post(':id/affectation')
  @Roles('responsable depot')
  async addAffectation(
    @Param('id') id: string,
    @Body() body: { entreprise: string; depot: string }
  ) {
    return this.clientService.addAffectation(id, body.entreprise, body.depot);
  }

  // 🆕 Créer un nouveau client, avec affectation automatique du responsable
  @Post()
  @Roles('responsable depot')
  async createClient(@Body() dto: CreateClientDto, @Req() req) {
    const user = req.user;
    if (user.role === 'responsable depot') {
      dto.affectations = [{ entreprise: user.entreprise, depot: user.depot }];
    }
    return this.clientService.create(dto);
  }

  // ✏️ Modifier les infos d’un client
  @Put(':id')
  @Roles('responsable depot')
  async updateClient(
    @Param('id') id: string,
    @Body() dto: Partial<CreateClientDto>
  ) {
    return this.clientService.update(id, dto);
  }

  // ❌ Supprimer un client
  @Delete(':id')
  @Roles('responsable depot')
  async deleteClient(@Param('id') id: string) {
    return this.clientService.delete(id);
  }
}

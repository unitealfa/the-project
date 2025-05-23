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
import { DepotHelperService } from '../common/helpers/depot-helper.service';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientController {
  constructor(
    private readonly clientService: ClientService,
    private readonly depotHelper: DepotHelperService,
  ) {}

  @Get()
  @Roles('Admin', 'responsable depot', 'superviseur des ventes', 'Administrateur des ventes')
  async getClients(@Req() req, @Query('depot') depotId?: string) {
    const user = req.user;
    if (user.role === 'responsable depot' || user.role === 'superviseur des ventes' || user.role === 'Administrateur des ventes') {
      return this.clientService.findByDepot(user.depot);
    }
    return depotId
      ? this.clientService.findByDepot(depotId)
      : this.clientService.findAll();
  }

  @Get('check')
  @Roles('Admin', 'responsable depot')
  async checkClient(@Query('email') email: string) {
    return this.clientService.findByEmail(email);
  }

  @Post(':id/affectation')
  @Roles('responsable depot')
  async addAffectation(
    @Param('id') id: string,
    @Body() body: { entreprise: string; depot: string }
  ) {
    return this.clientService.addAffectation(id, body.entreprise, body.depot);
  }

  @Post()
  @Roles('responsable depot')
  async createClient(@Body() dto: CreateClientDto, @Req() req) {
    const user = req.user;

    console.log('✅ USER dans createClient:', user);

    if (user.role === 'responsable depot') {
      const entrepriseId = await this.depotHelper.getEntrepriseFromDepot(user.depot);
      if (!entrepriseId) {
        throw new Error("Entreprise introuvable pour ce dépôt.");
      }

      dto.affectations = [{
        entreprise: entrepriseId.toString(),
        depot: user.depot.toString(),
      }];
    }

    return this.clientService.create(dto);
  }

  @Put(':id')
  @Roles('responsable depot')
  async updateClient(
    @Param('id') id: string,
    @Body() dto: Partial<CreateClientDto>
  ) {
    return this.clientService.update(id, dto);
  }

  @Delete(':id')
  @Roles('responsable depot')
  async deleteClient(@Param('id') id: string) {
    return this.clientService.delete(id);
  }
}

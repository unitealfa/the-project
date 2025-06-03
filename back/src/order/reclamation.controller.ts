import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ReclamationService } from './reclamation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators';

@Controller('api/reclamations')
@UseGuards(JwtAuthGuard)
export class ReclamationController {
  constructor(private readonly reclamationService: ReclamationService) {}

  @Post()
  async createReclamation(
    @GetUser('id') clientId: string,
    @Body() body: { orderId: string; titre: string; message: string }
  ) {
    return this.reclamationService.createReclamation(
      clientId,
      body.orderId,
      body.titre,
      body.message
    );
  }

  @Get('order/:orderId')
  async getReclamationsByOrder(@Param('orderId') orderId: string) {
    return this.reclamationService.getReclamationsByOrder(orderId);
  }

  @Get('client')
  async getReclamationsByClient(@GetUser('id') clientId: string) {
    return this.reclamationService.getReclamationsByClient(clientId);
  }

  @Get('depot/:depotId')
  async getReclamationsByDepot(@Param('depotId') depotId: string) {
    return this.reclamationService.getReclamationsByDepot(depotId);
  }

  @Patch(':id/status')
  async updateReclamationStatus(
    @Param('id') id: string,
    @Body() body: { status: 'en_attente' | 'resolue' | 'rejeter'; reponse?: string }
  ) {
    return this.reclamationService.updateReclamationStatus(
      id,
      body.status,
      body.reponse
    );
  }
} 
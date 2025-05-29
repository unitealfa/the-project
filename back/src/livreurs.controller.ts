import { Controller, Get, Param } from '@nestjs/common';
import { TourneeService } from './tournee/tournee.service';

@Controller('livreurs')
export class LivreursController {
  constructor(private readonly tourneeService: TourneeService) {}

  @Get(':livreurId/orders')
  async getOrders(@Param('livreurId') livreurId: string) {
    return this.tourneeService.getOrdersForLivreur(livreurId);
  }
}

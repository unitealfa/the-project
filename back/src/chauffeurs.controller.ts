import { Controller, Get, Param } from '@nestjs/common';
import { TourneeService } from './tournee/tournee.service';

@Controller('chauffeurs')
export class ChauffeursController {
  constructor(private readonly tourneeService: TourneeService) {}

  @Get(':chauffeurId/stops')
  async getStops(@Param('chauffeurId') chauffeurId: string) {
    return this.tourneeService.getStopsForChauffeur(chauffeurId);
  }
}

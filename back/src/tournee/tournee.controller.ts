import { Controller, Post, Query } from '@nestjs/common';
import { TourneeService } from './tournee.service';

@Controller('api/tournees')
export class TourneeController {
  constructor(private readonly tourneeService: TourneeService) {}

  /* POST /api/tournees/planifier?depotId=123 */
  @Post('planifier')
  async planifier(@Query('depotId') depotId: string) {
    if (!depotId) return { error: 'depotId requis' };
    return this.tourneeService.planifier(depotId);
  }
}

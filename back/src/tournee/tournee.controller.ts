// src/tournee/tournee.controller.ts
import { Controller, Post, Query, BadRequestException } from '@nestjs/common';
import { TourneeService } from './tournee.service';

@Controller('api/tournees')
export class TourneeController {
  constructor(private readonly tourneeService: TourneeService) {}

  /**
   * POST /api/tournees/planifier?depotId=...
   */
  @Post('planifier')
  async planifier(@Query('depotId') depotId: string) {
    if (!depotId) {
      throw new BadRequestException('Le paramètre depotId est requis');
    }
    return this.tourneeService.planifier(depotId);
  }
}

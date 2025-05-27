import { Controller, Post, Body, BadRequestException } from "@nestjs/common";
import { TourneeService } from "./tournee.service";

@Controller("tournees")
export class TourneeController {
  constructor(private readonly tourneeService: TourneeService) {}

  /**
   * POST /api/tournees/planifier
   * Body = payload VRP (depotId, date_interval, stops, fleet)
   */
  @Post("planifier")
  async planifier(@Body() payload: any) {
    if (!payload.depotId) {
      throw new BadRequestException("Le champ depotId est requis dans le corps de la requête");
    }
    if (!payload) {
      throw new BadRequestException("Payload VRP requis");
    }
    return this.tourneeService.proxyToVrpAndSave(payload.depotId, payload);
  }
}

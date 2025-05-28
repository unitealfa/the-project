import { Controller, Post, Body, BadRequestException, Get, Param, NotFoundException } from "@nestjs/common";
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

  /**
   * GET /api/tournees/depot/:depotId
   * Récupère toutes les tournées d'un dépôt
   */
  @Get("depot/:depotId")
  async getByDepot(@Param("depotId") depotId: string) {
    if (!depotId) {
      throw new BadRequestException("L'ID du dépôt est requis");
    }
    return this.tourneeService.findByDepot(depotId);
  }

  /**
   * GET /api/tournees/:id
   * Récupère les détails d'une tournée avec les produits à livrer par véhicule
   */
  @Get(":id")
  async getById(@Param("id") id: string) {
    if (!id) {
      throw new BadRequestException("L'ID de la tournée est requis");
    }
    const tournee = await this.tourneeService.findById(id);
    if (!tournee) {
      throw new NotFoundException("Tournée non trouvée");
    }
    return tournee;
  }
}

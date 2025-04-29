import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    UseGuards,
    Logger,
  } from '@nestjs/common';
  import { JwtAuthGuard }    from '../auth/jwt-auth.guard';
  import { RolesGuard }      from '../auth/roles.guard';
  import { Roles }           from '../auth/roles.decorator';
  import { DepotService }    from './depot.service';
  import { CreateDepotDto }  from './dto/create-depot.dto';
  
  @Controller('depots')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class DepotController {
    private readonly logger = new Logger(DepotController.name);
  
    constructor(private readonly svc: DepotService) {}
  
    /** Création de dépôt — accessible à l’Admin de la société */
    @Roles('Admin')
    @Post()
    async create(@Body() dto: CreateDepotDto, @Req() req: any) {
      this.logger.log(`Admin ${req.user.id} crée un dépôt pour sa société`);
      return this.svc.create(dto, req.user.id);
    }
  
    /** Lister les dépôts de la société de l’admin */
    @Roles('Admin')
    @Get()
    async findAllForMe(@Req() req: any) {
      this.logger.log(`Admin ${req.user.id} liste ses dépôts`);
      return this.svc.findAllForCompany(req.user.id);
    }
  }
  
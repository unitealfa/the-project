import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DepotService } from './depot.service';
import { CreateDepotDto } from './dto/create-depot.dto';

@Controller('depots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepotController {
  private readonly logger = new Logger(DepotController.name);

  constructor(private readonly svc: DepotService) {}

  @Roles('Admin')
  @Post()
  async create(@Body() dto: CreateDepotDto, @Req() req: any) {
    this.logger.log(`Admin ${req.user.id} crée un dépôt`);
    return this.svc.create(dto, req.user.id);
  }

  @Roles('Admin')
  @Get()
  async findAllForMe(@Req() req: any) {
    this.logger.log(`Admin ${req.user.id} liste ses dépôts`);
    return this.svc.findAllForCompany(req.user.id);
  }

  @Roles('Admin', 'responsable depot')
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`${req.user.role} ${req.user.id} consulte le dépôt ${id}`);
    return this.svc.findOne(id, req.user);
  }

  @Roles('Admin')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateDepotDto>, @Req() req: any) {
    this.logger.log(`Admin ${req.user.id} modifie le dépôt ${id}`);
    return this.svc.update(id, dto, req.user.id);
  }

  @Roles('Admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: any) {
    this.logger.log(`Admin ${req.user.id} supprime le dépôt ${id}`);
    return this.svc.remove(id, req.user.id);
  }
}

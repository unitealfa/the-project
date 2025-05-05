import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { DepotService } from './depot.service';
import { CreateDepotDto } from './dto/create-depot.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('depots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepotController {
  constructor(private readonly depotService: DepotService) {}

  @Post()
  @Roles('Admin')
  create(
    @Body() dto: CreateDepotDto,
    @Req() req: Request & { user: any },
  ) {
    return this.depotService.create(dto, req.user.id);
  }

  @Get()
  @Roles('Admin')
  findAll(@Req() req: Request & { user: any }) {
    return this.depotService.findAllForCompany(req.user.id);
  }

  @Get(':id')
  @Roles('Admin', 'responsable depot')
  findOne(
    @Param('id') id: string,
    @Req() req: Request & { user: any },
  ) {
    return this.depotService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('Admin')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateDepotDto>,
    @Req() req: Request & { user: any },
  ) {
    return this.depotService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @Roles('Admin')
  remove(
    @Param('id') id: string,
    @Req() req: Request & { user: any },
  ) {
    return this.depotService.remove(id, req.user.id);
  }
}

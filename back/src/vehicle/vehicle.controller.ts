import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Corrected path
import { RolesGuard } from '../auth/roles.guard'; // Corrected path
import { Roles } from '../auth/roles.decorator'; // Corrected path
import { UserDocument } from '../user/schemas/user.schema';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @Roles('Administrateur des ventes', 'Admin', 'Super Admin') // Only these roles can create
  create(@Body() createVehicleDto: CreateVehicleDto, @Req() req: { user: UserDocument }) {
    return this.vehicleService.create(createVehicleDto, req.user);
  }

  @Get()
  @Roles('Administrateur des ventes', 'Admin', 'Super Admin') // Adjust roles as needed for listing
  findAll(@Req() req: { user: UserDocument }) {
    return this.vehicleService.findAll(req.user);
  }

  @Get(':id')
  @Roles('Administrateur des ventes', 'Admin', 'Super Admin') // Adjust roles as needed
  findOne(@Param('id') id: string, @Req() req: { user: UserDocument }) {
    return this.vehicleService.findOne(id, req.user);
  }

  @Patch(':id')
  @Roles('Administrateur des ventes', 'Admin', 'Super Admin')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto, @Req() req: { user: UserDocument }) {
    return this.vehicleService.update(id, updateVehicleDto, req.user);
  }

  @Delete(':id')
  @Roles('Administrateur des ventes', 'Admin', 'Super Admin')
  remove(@Param('id') id: string, @Req() req: { user: UserDocument }) {
    return this.vehicleService.remove(id, req.user);
  }
}
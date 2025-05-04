import {
    Controller,
    Get,
    Post,
    Body,
    Put,
    Delete,
    Param,
    Query,
    UseGuards,
    Req,
  } from '@nestjs/common';
  import { ClientService } from './client.service';
  import { CreateClientDto } from './dto/create-client.dto';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/roles.guard';
  import { Roles } from '../auth/roles.decorator';
  import { Types } from 'mongoose';
  
  @Controller('clients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class ClientController {
    constructor(private readonly clientService: ClientService) {}
  
    @Get()
    @Roles('Admin', 'responsable depot')
    async getClients(@Req() req, @Query('depot') depotId?: string) {
      const user = req.user;
  
      if (user.role === 'responsable depot') {
        return this.clientService.findByDepot(user.depot);
      }
  
      return depotId
        ? this.clientService.findByDepot(depotId)
        : this.clientService.findAll();
    }
  
    @Post()
    @Roles('responsable depot')
    async createClient(@Body() dto: CreateClientDto, @Req() req) {
      const user = req.user;
  
      if (user.role === 'responsable depot') {
        dto.depot = new Types.ObjectId(user.depot);
      }
  
      return this.clientService.create(dto);
    }
  
    @Put(':id')
    @Roles('responsable depot')
    async updateClient(
      @Param('id') id: string,
      @Body() dto: Partial<CreateClientDto>
    ) {
      return this.clientService.update(id, dto);
    }
  
    @Delete(':id')
    @Roles('responsable depot')
    async deleteClient(@Param('id') id: string) {
      return this.clientService.delete(id);
    }
  }
  
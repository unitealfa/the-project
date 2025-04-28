// back/src/company/company.controller.ts

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CompanyService }      from './company.service';
import { CreateCompanyDto }    from './dto/create-company.dto';
import { CreateAdminDto }      from './dto/create-admin.dto';
import { JwtAuthGuard }        from '../auth/jwt-auth.guard';
import { RolesGuard }          from '../auth/roles.guard';
import { Roles }               from '../auth/roles.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  private readonly logger = new Logger(CompanyController.name);

  constructor(private readonly svc: CompanyService) {}

  /** Création d’une nouvelle company + admin — uniquement Super Admin */
  @Roles('Super Admin')
  @Post()
  async create(
    @Body('companyData') companyData: CreateCompanyDto,
    @Body('adminData')   adminData:   CreateAdminDto,
  ) {
    try {
      this.logger.log(
        `Création company=${JSON.stringify(companyData)}, admin=${JSON.stringify(adminData)}`,
      );
      return await this.svc.createWithAdmin(companyData, adminData);
    } catch (err: any) {
      this.logger.error('Erreur createWithAdmin', err.stack || err.message);
      if (err.status === 400 || err instanceof BadRequestException) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  /** Récupérer une company par son ID — Super Admin ET Admin */
  @Roles('Super Admin', 'Admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`findOne company id=${id}`);
    return this.svc.findOne(id);
  }
}

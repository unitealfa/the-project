// back/src/company/company.controller.ts

import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
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

  /** Création d’une company + Admin (Super Admin only) */
  @Roles('Super Admin')
  @Post()
  async create(
    @Body('companyData') companyData: CreateCompanyDto,
    @Body('adminData')   adminData:   CreateAdminDto,
  ) {
    try {
      this.logger.log(`Création ${JSON.stringify(companyData)}`);
      return await this.svc.createWithAdmin(companyData, adminData);
    } catch (err: any) {
      this.logger.error('Erreur createWithAdmin', err.stack || err.message);
      if (err.status === 400 || err instanceof BadRequestException) {
        throw new BadRequestException(err.message);
      }
      throw err;
    }
  }

  /** Liste de toutes les companies (Super Admin only) */
  @Roles('Super Admin')
  @Get()
  async findAll() {
    this.logger.log('Récupération de toutes les companies');
    return this.svc.findAll();
  }

  /** Détails d’une company (Super Admin + Admin) */
  @Roles('Super Admin', 'Admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`findOne id=${id}`);
    return this.svc.findOne(id);
  }

  /** Mise à jour d’une company (Super Admin only) */
  @Roles('Super Admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateCompanyDto>,
  ) {
    this.logger.log(`update id=${id}`);
    return this.svc.update(id, dto);
  }

  /** Suppression d’une company (Super Admin only) */
  @Roles('Super Admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`remove id=${id}`);
    await this.svc.delete(id);
    return { message: 'Société supprimée avec succès.' };
  }
}

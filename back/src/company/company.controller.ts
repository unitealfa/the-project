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
  UseInterceptors,
  Logger,
  BadRequestException,
  UploadedFile,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  private readonly logger = new Logger(CompanyController.name);

  constructor(private readonly svc: CompanyService) {}

  /** Création d’une société + Admin (Super Admin uniquement) */
  @Roles('Super Admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('pfp', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (_req, file, callback) => {
          const uniqueSuffix = Date.now() + extname(file.originalname);
          const filename = `company-${uniqueSuffix}`;
          callback(null, filename);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          callback(
            new BadRequestException('Seuls les fichiers image sont autorisés'),
            false,
          );
        } else {
          callback(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('companyData') companyDataJson: string,
    @Body('adminData') adminDataJson: string,
  ) {
    let companyData: CreateCompanyDto;
    let adminData: CreateAdminDto;
    try {
      companyData = JSON.parse(companyDataJson);
    } catch {
      throw new BadRequestException('companyData n’est pas un JSON valide');
    }
    try {
      adminData = JSON.parse(adminDataJson);
    } catch {
      throw new BadRequestException('adminData n’est pas un JSON valide');
    }

    const pfpPath = file ? `uploads/${file.filename}` : undefined;
    return await this.svc.createWithAdmin(companyData, adminData, pfpPath);
  }

  /** Liste de toutes les sociétés (Super Admin uniquement) */
  @Roles('Super Admin')
  @Get()
  async findAll() {
    this.logger.log('Récupération de toutes les sociétés');
    return this.svc.findAll();
  }

  /** Détails d’une société (Super Admin + Admin) */
  @Roles('Super Admin', 'Admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`findOne id=${id}`);
    return this.svc.findOne(id);
  }

  /** Mise à jour d’une société (Super Admin uniquement) */
  @Roles('Super Admin')
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('pfp', {
      storage: diskStorage({
        destination: './public/uploads',
        filename: (_req, file, callback) => {
          const uniqueSuffix = Date.now() + extname(file.originalname);
          const filename = `company-${uniqueSuffix}`;
          callback(null, filename);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('Seuls les fichiers image sont autorisés'),
            false,
          );
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('companyData') companyDataJson: string,
  ) {
    let dto: Partial<CreateCompanyDto>;
    try {
      dto = JSON.parse(companyDataJson);
    } catch {
      throw new BadRequestException('companyData n’est pas un JSON valide');
    }

    const pfpPath = file ? `uploads/${file.filename}` : undefined;
    return this.svc.update(id, dto, pfpPath);
  }

  /** Suppression d’une société (Super Admin uniquement) */
  @Roles('Super Admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`Suppression totale de la société id=${id}`);
    await this.svc.delete(id);
    return { message: 'Société et données associées supprimées avec succès.' };
  }
}

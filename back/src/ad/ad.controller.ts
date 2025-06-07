import { Controller, Post, Get, Delete, Param, Body, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdService } from './ad.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('ads')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdController {
  constructor(private readonly svc: AdService) {}

  @Roles('Super Admin')
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/ads',
        filename: (_req, file, cb) => {
          const unique = Date.now() + extname(file.originalname);
          cb(null, `ad-${unique}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        // Accept all image/* and video/* MIME types
        if (/^(image|video)\//.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Seuls les fichiers image ou vidéo sont autorisés'), false);
        }
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateAdDto,
  ) {
    const filePath = file ? `ads/${file.filename}` : '';
    try {
      return await this.svc.create({ ...dto, filePath });
    } catch (err) {
      console.error('❌ Error creating Ad:', err);
      throw err; // Log the exact error in the Node console
    }
  }

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get('company/:id')
  findByCompany(@Param('id') id: string) {
    return this.svc.findByCompany(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Roles('Super Admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.remove(id);
  }

  @Patch(':id')
  @Roles('Super Admin')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './public/ads',
        filename: (_req, file, cb) => {
          const unique = Date.now() + extname(file.originalname);
          cb(null, `ad-${unique}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UpdateAdDto,
  ) {
    const filePath = file ? `ads/${file.filename}` : undefined;
    return this.svc.update(id, { ...dto, filePath });
  }
}
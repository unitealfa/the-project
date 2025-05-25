import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Req,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ------- UPLOAD IMAGE PRODUIT -------
@Post('upload')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/products',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Type de fichier non supporté'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  })
)
uploadFile(@UploadedFile() file: Express.Multer.File) {
  if (!file) {
    return { error: "Aucun fichier envoyé" };
  }
  return {
    url: `/uploads/products/${file.filename}`,
  };
}


  // ------- ROUTES CRUD PRODUITS -------

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  // Cette route doit être AVANT @Get(':id')
  @Get('clients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Client')
  async getProduitsPourClient(@Req() req) {
    const user = req.user;

    const depots = (user.affectations ?? []).map((a: any) => {
      if (typeof a.depot === 'object' && '$oid' in a.depot) {
        return a.depot.$oid;
      }
      return a.depot;
    });

    const produits = await this.productService.findByDepots(depots);

    return produits;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Get('by-depot/:depotId')
  findByDepot(@Param('depotId') depotId: string) {
    return this.productService.findByDepot(depotId);
  }

  @Put(':id/depot/:depotId')
  async updateDepotQuantite(
    @Param('id') productId: string,
    @Param('depotId') depotId: string,
    @Body('quantite') quantite: number,
  ) {
    return this.productService.updateQuantiteParDepot(productId, depotId, quantite);
  }
}

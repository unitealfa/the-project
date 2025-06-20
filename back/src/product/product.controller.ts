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
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'ResponsableDepot', 'Gestionnaire de stock')
  create(@Body() dto: CreateProductDto, @Req() req) {
    const enrichedDto = {
      ...dto,
      company_id: req.user.company,
    };
    return this.productService.create(enrichedDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  // ✅ Cette route doit être AVANT @Get(':id')
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

    console.log("📥 Dépôts du client :", depots);

    const produits = await this.productService.findByDepots(depots);

    console.log("📦 Produits trouvés :", produits.length);

    return produits;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'ResponsableDepot', 'Gestionnaire de stock')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req) {
    console.log('Received update request for product:', id);
    console.log('Request body:', dto);
    console.log('User company:', req.user.company);
    
    const enrichedDto = {
      ...dto,
      company_id: req.user.company,
    };
    
    console.log('Enriched DTO:', enrichedDto);
    
    return this.productService.update(id, enrichedDto);
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

  /** Import en masse depuis Excel */
  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'ResponsableDepot', 'Gestionnaire de stock')
  async bulkCreate(
    @Body() dtos: CreateProductDto[],
    @Req() req,
  ): Promise<{ success: number; errors: { row: number; message: string }[] }> {
    const companyId = req.user.company;
    const depotId = req.query.depot as string;

    const enriched = dtos.map(dto => ({
      ...dto,
      company_id: companyId,
      disponibilite: depotId
        ? [{ depot_id: depotId, quantite: 0 }]
        : dto.disponibilite || [],
    }));

    return this.productService.bulkCreate(enriched);
  }
}
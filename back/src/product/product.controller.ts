// back/src/product/product.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
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

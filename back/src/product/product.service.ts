import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schema/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const created = new this.productModel({
      ...dto,
      date_expiration: new Date(dto.date_expiration),
    });
    return created.save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    const prod = await this.productModel.findById(id).exec();
    if (!prod) throw new NotFoundException(`Produit ${id} introuvable`);
    return prod;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    if (dto.date_expiration) {
      dto.date_expiration = new Date(dto.date_expiration) as any;
    }
    const updated = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) throw new NotFoundException(`Produit ${id} introuvable`);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const res = await this.productModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Produit ${id} introuvable`);
  }
}

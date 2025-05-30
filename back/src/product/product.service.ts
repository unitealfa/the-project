import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schema/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async create(dto: CreateProductDto): Promise<Product> {
    return new this.productModel(dto).save();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).exec();
    if (!product) throw new NotFoundException('Produit non trouvé');
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const updated = await this.productModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Produit non trouvé');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.productModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Produit non trouvé');
  }

  async findByDepot(depotId: string): Promise<Product[]> {
    return this.productModel.find({
      disponibilite: {
        $elemMatch: {
          depot_id: new Types.ObjectId(depotId),
        },
      },
    }).exec();
  }

  async findByDepots(depotIds: string[]): Promise<Product[]> {
    const objectDepotIds = depotIds.map((id) => new Types.ObjectId(id));

    console.log('🔍 Recherche de produits pour les dépôts :', objectDepotIds); // Debug

    const results = await this.productModel.find({
      disponibilite: {
        $elemMatch: {
          depot_id: { $in: objectDepotIds },
          quantite: { $gt: 0 }, // filtre les produits avec stock uniquement
        },
      },
    }).exec();

    console.log("🎯 Résultats trouvés :", results.length); // Debug

    return results;
  }

  async updateQuantiteParDepot(productId: string, depotId: string, quantite: number): Promise<Product> {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Produit introuvable');

    const depotObjectId = new Types.ObjectId(depotId);
    const dispo = product.disponibilite.find((d) => d.depot_id.toString() === depotId);

    if (dispo) {
      dispo.quantite = quantite;
    } else {
      product.disponibilite.push({
        depot_id: depotObjectId,
        quantite,
      });
    }

    return product.save();
  }

  /**
   * Sauvegarde en boucle chaque DTO,
   * collecte les lignes en erreur pour retourner { success, errors }
   */
  async bulkCreate(
    dtos: CreateProductDto[],
  ): Promise<{ success: number; errors: { row: number; message: string }[] }> {
    const errors: { row: number; message: string }[] = [];
    let success = 0;

    for (let i = 0; i < dtos.length; i++) {
      try {
        await new this.productModel(dtos[i]).save();
        success++;
      } catch (err: any) {
        errors.push({ row: i + 1, message: err.message });
      }
    }

    return { success, errors };
  }
}
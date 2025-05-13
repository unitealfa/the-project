import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wishlist } from './schemas/wishlist.schema';
import { AddToWishlistDto, RemoveFromWishlistDto } from './dto/create-wishlist.dto';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    @InjectModel(Wishlist.name) private wishlistModel: Model<Wishlist>,
  ) {}

  async getWishlist(userId: Types.ObjectId) {
    try {
      this.logger.debug(`Récupération de la wishlist pour l'utilisateur ${userId}`);
      const wishlist = await this.wishlistModel
        .findOne({ user: userId })
        .populate({
          path: 'products',
          select: 'nom_product description prix_detail images'
        })
        .exec();

      if (!wishlist) {
        this.logger.debug(`Création d'une nouvelle wishlist pour l'utilisateur ${userId}`);
        return this.wishlistModel.create({ user: userId, products: [] });
      }

      return wishlist;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de la wishlist: ${error.message}`);
      throw error;
    }
  }

  async addToWishlist(userId: Types.ObjectId, addToWishlistDto: AddToWishlistDto) {
    try {
      this.logger.debug(`Ajout du produit ${addToWishlistDto.productId} à la wishlist de l'utilisateur ${userId}`);
      const wishlist = await this.wishlistModel.findOne({ user: userId });

      if (!wishlist) {
        this.logger.debug(`Création d'une nouvelle wishlist avec le produit ${addToWishlistDto.productId}`);
        return this.wishlistModel.create({
          user: userId,
          products: [addToWishlistDto.productId],
        });
      }

      const productExists = wishlist.products.some(
        (productId) => productId.toString() === addToWishlistDto.productId.toString()
      );

      if (!productExists) {
        this.logger.debug(`Ajout du produit ${addToWishlistDto.productId} à la wishlist existante`);
        wishlist.products.push(addToWishlistDto.productId);
        await wishlist.save();
      } else {
        this.logger.debug(`Le produit ${addToWishlistDto.productId} est déjà dans la wishlist`);
      }

      return this.wishlistModel
        .findById(wishlist._id)
        .populate({
          path: 'products',
          select: 'nom_product description prix_detail images'
        })
        .exec();
    } catch (error) {
      this.logger.error(`Erreur lors de l'ajout à la wishlist: ${error.message}`);
      throw error;
    }
  }

  async removeFromWishlist(userId: Types.ObjectId, removeFromWishlistDto: RemoveFromWishlistDto) {
    try {
      this.logger.debug(`Suppression du produit ${removeFromWishlistDto.productId} de la wishlist de l'utilisateur ${userId}`);
      const wishlist = await this.wishlistModel.findOne({ user: userId });

      if (!wishlist) {
        this.logger.warn(`Wishlist non trouvée pour l'utilisateur ${userId}`);
        throw new NotFoundException('Wishlist not found');
      }

      wishlist.products = wishlist.products.filter(
        (productId) => productId.toString() !== removeFromWishlistDto.productId.toString()
      );

      await wishlist.save();
      this.logger.debug(`Produit ${removeFromWishlistDto.productId} supprimé de la wishlist`);

      return this.wishlistModel
        .findById(wishlist._id)
        .populate({
          path: 'products',
          select: 'nom_product description prix_detail images'
        })
        .exec();
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression de la wishlist: ${error.message}`);
      throw error;
    }
  }
} 
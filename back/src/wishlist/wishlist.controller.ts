import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WishlistService } from './wishlist.service';
import { Types } from 'mongoose';
import { AddToWishlistDto, RemoveFromWishlistDto } from './dto/create-wishlist.dto';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getWishlist(@Req() req) {
    console.log('🔍 Récupération de la wishlist pour l\'utilisateur:', req.user);
    return this.wishlistService.getWishlist(new Types.ObjectId(req.user.id));
  }

  @Post(':productId')
  async addToWishlist(@Req() req, @Param('productId') productId: string) {
    console.log('➕ Ajout du produit à la wishlist:', { userId: req.user.id, productId });
    const addToWishlistDto: AddToWishlistDto = {
      productId: new Types.ObjectId(productId)
    };
    return this.wishlistService.addToWishlist(
      new Types.ObjectId(req.user.id),
      addToWishlistDto
    );
  }

  @Delete(':productId')
  async removeFromWishlist(@Req() req, @Param('productId') productId: string) {
    console.log('➖ Suppression du produit de la wishlist:', { userId: req.user.id, productId });
    const removeFromWishlistDto: RemoveFromWishlistDto = {
      productId: new Types.ObjectId(productId)
    };
    return this.wishlistService.removeFromWishlist(
      new Types.ObjectId(req.user.id),
      removeFromWishlistDto
    );
  }
} 
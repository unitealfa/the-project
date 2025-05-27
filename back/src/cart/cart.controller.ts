import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/create-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @Roles('Pré-vendeur', 'Client')
  async addToCart(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Body() createCartItemDto: CreateCartItemDto,
    @Req() req
  ) {
    // Si c'est un prévendeur, le clientId est requis
    if (userRole === 'Pré-vendeur' && !createCartItemDto.clientId) {
      throw new Error('Client ID is required for pre-seller');
    }
    // Si c'est un client, utiliser son propre ID
    const targetUserId = userRole === 'Pré-vendeur' ? createCartItemDto.clientId : userId;
    return this.cartService.addToCart(targetUserId, createCartItemDto);
  }

  @Get()
  @Roles('Pré-vendeur', 'Client')
  async getCart(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Req() req
  ) {
    // Si c'est un prévendeur, le clientId est requis
    if (userRole === 'Pré-vendeur' && !req.query.clientId) {
      throw new Error('Client ID is required for pre-seller');
    }
    // Si c'est un client, utiliser son propre ID
    const targetUserId = userRole === 'Pré-vendeur' ? req.query.clientId : userId;
    return this.cartService.getCart(targetUserId);
  }

  @Put(':productId')
  @Roles('Pré-vendeur', 'Client')
  async updateCartItem(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req
  ) {
    // Si c'est un prévendeur, le clientId est requis
    if (userRole === 'Pré-vendeur' && !req.body.clientId) {
      throw new Error('Client ID is required for pre-seller');
    }
    // Si c'est un client, utiliser son propre ID
    const targetUserId = userRole === 'Pré-vendeur' ? req.body.clientId : userId;
    return this.cartService.updateCartItem(targetUserId, productId, updateCartItemDto);
  }

  @Delete(':productId')
  @Roles('Pré-vendeur', 'Client')
  async removeFromCart(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Param('productId') productId: string,
    @Req() req
  ) {
    // Si c'est un prévendeur, le clientId est requis
    if (userRole === 'Pré-vendeur' && !req.query.clientId) {
      throw new Error('Client ID is required for pre-seller');
    }
    // Si c'est un client, utiliser son propre ID
    const targetUserId = userRole === 'Pré-vendeur' ? req.query.clientId : userId;
    return this.cartService.removeFromCart(targetUserId, productId);
  }

  @Delete()
  @Roles('Pré-vendeur', 'Client')
  async clearCart(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: string,
    @Req() req
  ) {
    // Si c'est un prévendeur, le clientId est requis
    if (userRole === 'Pré-vendeur' && !req.query.clientId) {
      throw new Error('Client ID is required for pre-seller');
    }
    // Si c'est un client, utiliser son propre ID
    const targetUserId = userRole === 'Pré-vendeur' ? req.query.clientId : userId;
    return this.cartService.clearCart(targetUserId);
  }
} 
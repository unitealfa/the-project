import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto, UpdateCartItemDto } from './dto/create-cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators';

@Controller('api/cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async addToCart(
    @GetUser('id') userId: string,
    @Body() createCartItemDto: CreateCartItemDto,
  ) {
    return this.cartService.addToCart(userId, createCartItemDto);
  }

  @Get()
  async getCart(@GetUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Put(':productId')
  async updateCartItem(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(userId, productId, updateCartItemDto);
  }

  @Delete(':productId')
  async removeFromCart(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeFromCart(userId, productId);
  }

  @Delete()
  async clearCart(@GetUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
} 
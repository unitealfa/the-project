import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators';

@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(
    @GetUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(userId, createOrderDto);
  }

  @Get()
  async getAllOrders(@GetUser() user: any) {
    const depotId = user.depot;
    if (!depotId) {
      throw new UnauthorizedException("Aucun dépôt associé à cet utilisateur");
    }
    return this.orderService.findByDepot(depotId);
  }

  // ---- AJOUT POUR CONFIRMATION ----
  @Patch(':id/confirm')
  async confirmOrder(@Param('id') orderId: string) {
    return this.orderService.confirmOrder(orderId);
  }
}

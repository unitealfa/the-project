// back/src/orders/order.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  UnauthorizedException,
  NotFoundException,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Delete
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';    // ← nouveau
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/decorators';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: { id: string };
}

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

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    const order = await this.orderService.findById(id);
    if (!order) {
      throw new NotFoundException(`Commande avec l'ID ${id} non trouvée`);
    }
    return order;
  }

  // ← NOUVEL ENDPOINT
  @Patch(':id/confirm')
  async confirmOrder(
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderDto,
  ) {
    // vous pouvez ignorer le dto.confirmed et forcer à true
    return this.orderService.confirmOrder(orderId);
  }

  @Patch(':id/delivery-status')
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body('status') status: 'en_attente' | 'en_cours' | 'livree'
  ) {
    return this.orderService.updateDeliveryStatus(id, status);
  }

  @Post(':id/photos')
  @UseInterceptors(
    FilesInterceptor('photos', 4, {
      storage: diskStorage({
        destination: (req: RequestWithUser, file, cb) => {
          const orderId = req.params.id;
          const livreurId = req.user.id;
          const date = new Date().toISOString().slice(0, 10);
          const uploadPath = `uploads/delivery/${orderId}/${livreurId}/${date}`;
          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${unique}${extname(file.originalname)}`);
        }
      }),
      fileFilter: (req, file, cb) => cb(null, true),
    })
  )
  async uploadOrderPhotos(
    @Param('id') orderId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser('id') livreurId: string,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucune photo reçue');
    }
    const date = new Date().toISOString().slice(0, 10);
    const urlBase = `/uploads/delivery/${orderId}/${livreurId}/${date}`;
    const photos = files.map(f => ({
      url: `${urlBase}/${f.filename}`,
      takenAt: new Date(),
    }));
    return this.orderService.addDeliveryPhotos(orderId, photos);
  }

  @Delete(':id/photos/:photoIdx')
  async deleteOrderPhoto(
    @Param('id') orderId: string,
    @Param('photoIdx') photoIdx: string
  ) {
    return this.orderService.deleteDeliveryPhoto(orderId, parseInt(photoIdx, 10));
  }
}

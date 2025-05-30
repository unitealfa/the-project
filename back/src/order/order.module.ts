import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/order.schema';
import { Client, ClientSchema } from '../client/schemas/client.schema';
import { Reclamation, ReclamationSchema } from './schemas/reclamation.schema';
import { OrderController } from './order.controller';
import { ReclamationController } from './reclamation.controller';
import { OrderService } from './order.service';
import { ReclamationService } from './reclamation.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Reclamation.name, schema: ReclamationSchema }
    ]),
  ],
  controllers: [OrderController, ReclamationController],
  providers: [OrderService, ReclamationService],
  exports: [OrderService, ReclamationService]
})
export class OrderModule {}
    
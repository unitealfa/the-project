import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Tournee, TourneeSchema } from './schemas/tournee.schema';
import { Depot, DepotSchema }   from '../depot/schemas/depot.schema';
import { Client, ClientSchema } from '../client/schemas/client.schema';
import { Vehicle, VehicleSchema } from '../vehicle/schemas/vehicle.schema';
import { Order, OrderSchema } from '../order/schemas/order.schema';

import { TourneeService }    from './tournee.service';
import { TourneeController } from './tournee.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tournee.name, schema: TourneeSchema },
      { name: Depot.name,   schema: DepotSchema },
      { name: Client.name,  schema: ClientSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
  ],
  controllers: [TourneeController],
  providers:   [TourneeService],
  exports:     [TourneeService],
})
export class TourneeModule {}

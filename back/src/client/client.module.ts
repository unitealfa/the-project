import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Client, ClientSchema } from "./schemas/client.schema";
import { ClientService } from "./client.service";
import { ClientController } from "./client.controller";
import { Order, OrderSchema } from "../order/schemas/order.schema";

import { Depot, DepotSchema } from "../depot/schemas/depot.schema";
import { DepotHelperService } from "../common/helpers/depot-helper.service";
import { User, UserSchema } from "../user/schemas/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Client", schema: ClientSchema },
      { name: "Depot", schema: DepotSchema },
      { name: Order.name, schema: OrderSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ClientController],
  providers: [ClientService, DepotHelperService],
  exports: [MongooseModule],
})
export class ClientModule {}

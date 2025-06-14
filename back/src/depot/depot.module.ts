import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Depot, DepotSchema } from "./schemas/depot.schema";
import { User, UserSchema } from "../user/schemas/user.schema";
import { Client, ClientSchema } from "../client/schemas/client.schema";
import { DepotService } from "./depot.service";
import { DepotController } from "./depot.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Depot.name, schema: DepotSchema },
      { name: User.name, schema: UserSchema },
      { name: Client.name, schema: ClientSchema },
    ]),
  ],
  providers: [DepotService],
  controllers: [DepotController],
})
export class DepotModule {}

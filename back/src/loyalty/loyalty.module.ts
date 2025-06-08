import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyProgram, LoyaltyProgramSchema } from './schemas/program.schema';
import { LoyaltyReward, LoyaltyRewardSchema } from './schemas/reward.schema';
import { Company, CompanySchema } from '../company/schemas/company.schema';
import { Client, ClientSchema } from '../client/schemas/client.schema';
import { Order, OrderSchema } from '../order/schemas/order.schema';
import { Depot, DepotSchema } from '../depot/schemas/depot.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoyaltyProgram.name, schema: LoyaltyProgramSchema },
      { name: LoyaltyReward.name, schema: LoyaltyRewardSchema },
      { name: Company.name, schema: CompanySchema },
      { name: Client.name, schema: ClientSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Depot.name, schema: DepotSchema },
    ]),
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
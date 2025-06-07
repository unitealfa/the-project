import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';
import { Ad, AdSchema } from './schemas/ad.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Ad.name, schema: AdSchema }])],
  controllers: [AdController],
  providers: [AdService],
})
export class AdModule {}
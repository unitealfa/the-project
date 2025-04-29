// back/src/depot/depot.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Depot, DepotSchema } from './schemas/depot.schema';
import { DepotService }       from './depot.service';
import { DepotController }    from './depot.controller';
import { User, UserSchema }   from '../user/schemas/user.schema';

@Module({
  imports: [
    // On enregistre le schéma Depot
    MongooseModule.forFeature([
      { name: Depot.name, schema: DepotSchema },
    ]),
    // On a besoin d'accéder aux users pour retrouver company de l'admin
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [DepotService],
  controllers: [DepotController],
  exports: [],
})
export class DepotModule {}

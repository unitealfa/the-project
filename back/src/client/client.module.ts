import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from './schemas/client.schema';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';

import { Depot, DepotSchema } from '../depot/schemas/depot.schema'; // 👈 Ajouté
import { DepotHelperService } from '../common/helpers/depot-helper.service'; // 👈 Ajouté

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Client', schema: ClientSchema },
      { name: 'Depot', schema: DepotSchema }, // 👈 Ajouté
    ]),
  ],
  controllers: [ClientController],
  providers: [ClientService, DepotHelperService], // 👈 Ajouté
  exports: [MongooseModule],
})
export class ClientModule {}

// back/src/company/company.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

import { Company, CompanySchema } from './schemas/company.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { Client, ClientSchema } from '../client/schemas/client.schema';
import { Depot, DepotSchema } from '../depot/schemas/depot.schema'; // ✅ ajout du schéma dépôt

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Company.name, schema: CompanySchema },
      { name: User.name, schema: UserSchema },
      { name: Client.name, schema: ClientSchema },
      { name: Depot.name, schema: DepotSchema }, // ✅ nécessaire pour les opérations en cascade
    ]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}

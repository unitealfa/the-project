import { Module }         from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule }   from '@nestjs/config';

import { AuthModule }     from './auth/auth.module';
import { UserModule }     from './user/user.module';
import { CompanyModule }  from './company/company.module';
import { DepotModule }    from './depot/depot.module';
import { TeamModule }     from './team/team.module';
import { ClientModule }   from './client/client.module';
import { ProductModule }  from './product/product.module';  // ← ajouté

@Module({
  imports: [
    /* charge les variables .env dans tout le projet */
    ConfigModule.forRoot({ isGlobal: true }),

    /* connexion MongoDB */
    MongooseModule.forRoot(process.env.MONGO_URI),

    /* modules fonctionnels */
    AuthModule,
    UserModule,
    CompanyModule,
    DepotModule,
    TeamModule,
    ClientModule,           // assure l'enregistrement de /clients
    ProductModule,          // assure l'enregistrement de /products
  ],
})
export class AppModule {}

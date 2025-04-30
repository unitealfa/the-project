import { Module }           from '@nestjs/common';
import { MongooseModule }   from '@nestjs/mongoose';
import { ConfigModule }     from '@nestjs/config';

import { AuthModule }       from './auth/auth.module';
import { UserModule }       from './user/user.module';
import { CompanyModule }    from './company/company.module';
import { DepotModule }      from './depot/depot.module';
import { TeamModule }       from './team/team.module'; 

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
    TeamModule,            // ← ajout du nouveau module
  ],
})
export class AppModule {}

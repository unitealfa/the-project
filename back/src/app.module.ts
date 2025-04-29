import { Module }           from '@nestjs/common';
import { MongooseModule }   from '@nestjs/mongoose';
import { ConfigModule }     from '@nestjs/config';

import { UserModule }       from './user/user.module';
import { AuthModule }       from './auth/auth.module';
import { CompanyModule }    from './company/company.module';
import { DepotModule }      from './depot/depot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UserModule,
    CompanyModule,
    DepotModule,
  ],
})
export class AppModule {}

import { Module }         from '@nestjs/common';
import { ConfigModule }   from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { UserModule }    from './user/user.module';
import { AuthModule }    from './auth/auth.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UserModule,
    CompanyModule,
  ],
})
export class AppModule {}

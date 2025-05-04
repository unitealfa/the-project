// back/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller'; // ✅ AJOUT ICI

import { User, UserSchema } from '../user/schemas/user.schema';
import { Client, ClientSchema } from '../client/schemas/client.schema';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: 'Client', schema: ClientSchema },
    ]),
  ],
  controllers: [AuthController], // ✅ ENREGISTRÉ ICI
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

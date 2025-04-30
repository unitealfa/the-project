// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    // ⬇︎  on NE passe plus signOptions.expiresIn
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      //  <-- pas de signOptions ➜ pas de `exp` signé
    }),
  ],
  providers: [JwtStrategy],
  exports:   [JwtModule, PassportModule],
})
export class AuthModule {}

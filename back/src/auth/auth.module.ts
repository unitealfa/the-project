import { Module }       from '@nestjs/common';
import { JwtModule }    from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy }  from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    /* — ne signe pas le `exp` → pas de déconnexion forcée — */
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ],
  providers: [JwtStrategy],
  exports:   [JwtModule, PassportModule],
})
export class AuthModule {}

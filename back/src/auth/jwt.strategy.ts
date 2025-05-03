import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  /**
   * Le contenu retourné ici est injecté dans `req.user`
   */
  async validate(payload: any) {
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      depot: payload.depot || null, // ← utile pour le responsable dépôt
    };
  }
}

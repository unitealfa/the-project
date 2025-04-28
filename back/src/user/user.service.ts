// back/src/user/user.service.ts

import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel }                         from '@nestjs/mongoose';
import { Model }                               from 'mongoose';
import { JwtService }                          from '@nestjs/jwt';
import * as bcrypt                             from 'bcrypt';
import { User }                                from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Utilisateur non trouvé.');

    const match = user.password.startsWith('$2')
      ? await bcrypt.compare(password, user.password)
      : password === user.password;
    if (!match) throw new UnauthorizedException('Mot de passe incorrect.');

    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const token   = this.jwtService.sign(payload);

    // ← on inclut maintenant company et num
    return {
      token,
      user: {
        id:      user._id,
        nom:     user.nom,
        prenom:  user.prenom,
        email:   user.email,
        role:    user.role,
        company: user.company?.toString() ?? null,
        num:     user.num,
      },
    };
  }
}

import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).select('+password +depot').populate('company').exec();
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedException('Mot de passe invalide');

    return user;
  }

  async login(user: UserDocument): Promise<{ access_token: string }> {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      depot: user.depot || null,
    };

    const access_token = this.jwtService.sign(payload); // ⛔ pas d'expiration
    return { access_token };
  }
}

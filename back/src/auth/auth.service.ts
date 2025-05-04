import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from '../user/schemas/user.schema';
import { Client } from '../client/schemas/client.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel('Client') private readonly clientModel: Model<Client>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({ email })
      .select('+password +depot')
      .populate('company')
      .exec();

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

    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  async validateClient(email: string, password: string): Promise<any> {
    const client = await this.clientModel
      .findOne({ email })
      .select('+password +depot')
      .exec();

    if (!client) throw new NotFoundException('Client introuvable');
    const isValid = await bcrypt.compare(password, client.password);
    if (!isValid) throw new UnauthorizedException('Mot de passe invalide');

    return client;
  }

  async loginClient(client: any): Promise<{ access_token: string }> {
    const payload = {
      id: client._id,
      email: client.email,
      role: client.role,
      depot: client.depot || null,
    };

    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}

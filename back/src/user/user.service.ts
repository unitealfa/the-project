import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmailWithCompany(email: string) {
    const doc = await this.userModel
      .findOne({ email })
      .select('+password +depot')
      .populate('company')
      .exec();

    if (!doc) throw new NotFoundException('Utilisateur introuvable');
    return doc;
  }

  async findAll() {
    return this.userModel.find().select('-password').exec();
  }
}

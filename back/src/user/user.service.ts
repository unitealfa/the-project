import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwt: JwtService,
  ) {}

  /** Cherche l’utilisateur + jointure société + sélection du hash et du dépôt */
  async findByEmailWithCompany(email: string) {
    const doc = await this.userModel
      .findOne({ email })
      .select('+password +depot')           // ✅ ajoute mot de passe ET dépôt
      .populate('company')                  // Company complet (nom_company, …)
      .exec();                              // <-- on garde un *document*
    if (!doc) throw new NotFoundException('Utilisateur introuvable');
    return doc;                             // type : UserDocument
  }

  /** Vérifie le mot de passe puis signe un JWT (pas d’expiration) */
  async checkPasswordAndSignJwt(
    doc: UserDocument,
    plain: string,
  ): Promise<string> {
    const ok = await bcrypt.compare(plain, doc.password);
    if (!ok) throw new UnauthorizedException('Mot de passe invalide');

    return this.jwt.sign({
      id    : doc._id,
      email : doc.email,
      role  : doc.role,
      depot : doc.depot || null,   // ✅ ajoute le dépôt ici aussi
    });
  }
}

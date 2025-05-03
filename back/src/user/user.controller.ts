import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userSvc: UserService,
    private readonly authSvc: AuthService,
  ) {}

  /** POST /user/login */
  @Post('login')
  async login(@Body() { email, password }: { email: string; password: string }) {
    // 1 ) document Mongoose + société
    const doc = await this.authSvc.validateUser(email, password);

    // 2 ) JWT
    const { access_token } = await this.authSvc.login(doc);

    // 3 ) On « dé-Mongoose » pour sérialiser facilement
    const obj: any = doc.toObject(); // <- any pour TS

    return {
      token: access_token,
      user: {
        id: obj._id.toString(),
        nom: obj.nom,
        prenom: obj.prenom,
        email: obj.email,
        role: obj.role,
        fonction: obj.fonction,
        company: obj.company?._id ?? null,
        companyName: obj.company?.nom_company ?? null,
        num: obj.num,
        depot: obj.depot ?? null,
      },
    };
  }
}

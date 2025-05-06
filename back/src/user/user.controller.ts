import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userSvc: UserService,
    private readonly authSvc: AuthService,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: { email: string; password: string }) {
    const doc = await this.authSvc.validateUser(email, password);
    const { access_token } = await this.authSvc.login(doc);
    const obj: any = doc.toObject();

    return {
      token: access_token,
      user: {
        id: obj._id.toString(),
        nom: obj.nom,
        prenom: obj.prenom,
        email: obj.email,
        role: obj.role,
        company: obj.company?._id ?? null,
        companyName: obj.company?.nom_company ?? null,
        num: obj.num,
        depot: obj.depot ?? null,
      },
    };
  }
}

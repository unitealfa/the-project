import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    try {
      // Utilisateur interne
      const user = await this.authService.validateUser(email, password);
      const { access_token } = await this.authService.login(user);

      let companyId: string | null = null;
      if (user.company) {
        if (typeof (user.company as any)?._id !== 'undefined') {
          companyId = (user.company as any)._id.toString();
        } else {
          companyId = user.company.toString();
        }
      }

      return {
        access_token,
        user: {
          id: user._id.toString(),
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          company: companyId,
          companyName:
            companyId && typeof user.company !== 'string'
              ? (user.company as any).nom_company || (user.company as any).nom
              : null,
          num: user.num,
          depot: user.depot?.toString() || null,
          pfp: user.pfp,
        },
      };
    } catch {
      // CLIENT : on garde l'objet enrichi !
      const client = await this.authService.validateClient(email, password);
      const { access_token, user } = await this.authService.loginClient(client);

      return {
        access_token,
        user,
      };
    }
  }

  @Post('login-client')
  async loginClient(@Body() body: { email: string; password: string }) {
    const client = await this.authService.validateClient(body.email, body.password);
    return this.authService.loginClient(client);
  }
}

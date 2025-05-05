import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    try {
      // 1️⃣ First try internal user
      const user = await this.authService.validateUser(email, password);
      const { access_token } = await this.authService.login(user);

      return {
        access_token,
        user: {
          id: user._id.toString(),
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          fonction: user.fonction || null,
          company: user.company?.toString() || null,
          companyName:
            typeof user.company === 'object' && 'nom' in user.company
              ? (user.company as any).nom
              : null,
          num: user.num,
          depot: user.depot?.toString() || null,
        },
      };
    } catch {
      // 2️⃣ Fallback to client
      const client = await this.authService.validateClient(email, password);
      const { access_token } = await this.authService.loginClient(client);

      return {
        access_token,
        user: {
          id: client._id.toString(),
          nom_client: client.nom_client,
          email: client.email,
          role: client.role,
          fonction: null,
          company: null,
          companyName: null,
          num: '',
          depot: client.depot?.toString() || null,
        },
      };
    }
  }
}

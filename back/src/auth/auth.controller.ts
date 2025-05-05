// back/src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Types } from 'mongoose';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    try {
      // 1️⃣ Tentative en tant qu’utilisateur interne
      const user = await this.authService.validateUser(email, password);
      const { access_token } = await this.authService.login(user);

      // On récupère l’ID de company même si c’est un document peuplé
      let companyId: string | null = null;
      if (user.company) {
        // si populate('company') → company est un objet
        if (typeof (user.company as any)?._id !== 'undefined') {
          companyId = (user.company as any)._id.toString();
        } else {
          // sinon c’est déjà un ObjectId
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
          fonction: user.fonction || null,
          company: companyId,
          companyName:
            companyId && typeof user.company !== 'string'
              ? (user.company as any).nom_company || (user.company as any).nom
              : null,
          num: user.num,
          depot: user.depot?.toString() || null,
        },
      };
    } catch {
      // 2️⃣ Si échec → tentative en tant que client
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

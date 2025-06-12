import { Controller, Post, Body, Get, UseGuards, Logger, Req } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userSvc: UserService,
    private readonly authSvc: AuthService,
  ) {}

  @Post('login')
  async login(@Body() { email, password }: { email: string; password: string }) {
    const doc = await this.authSvc.validateUser(email, password);
    const { access_token } = await this.authSvc.login(doc);
    const obj: any = doc.toObject();

    this.logger.log(`🔑 Connexion réussie pour ${obj.email} avec le rôle ${obj.role}`);

    return {
      token: access_token,
      user: {
        id: obj._id.toString(),
        nom: obj.nom,
        prenom: obj.prenom,
        email: obj.email,
        role: obj.role,
        company: obj.company?._id.toString() ?? null,  // ← seulement l'ID
        companyName: obj.company?.nom_company ?? null,
        depot: obj.depot?.toString() ?? null,
        num: obj.num,
      },
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'responsable depot', 'Administrateur des ventes', 'Pré-vendeur')
  async findAll(@Req() req) {
    this.logger.log('📥 Tentative d\'accès à la route /users');
    this.logger.log('👤 Utilisateur connecté:', {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role,
    });
    
    try {
      const users = await this.userSvc.findAll();
      this.logger.log(`✅ ${users.length} utilisateurs trouvés`);
      return users;
    } catch (error) {
      this.logger.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }
  
  @Get('super-admin-phone')
  async superAdminPhone() {
    const num = await this.userSvc.getSuperAdminPhone();
    return { num };
  }
}

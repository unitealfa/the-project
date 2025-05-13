import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!required) return true;

    const { user } = ctx.switchToHttp().getRequest();

    console.log('🛡️ Détails du rôle reçu du JWT :', {
      role: user?.role,
      roleType: typeof user?.role,
      roleLength: user?.role?.length,
      roleChars: user?.role?.split('').map(c => `${c} (${c.charCodeAt(0)})`),
    });
    console.log('🔐 Rôles attendus pour la route :', required.map(r => ({
      role: r,
      roleType: typeof r,
      roleLength: r.length,
      roleChars: r.split('').map(c => `${c} (${c.charCodeAt(0)})`),
    })));

    // Normaliser la casse des rôles
    const userRole = user?.role?.toLowerCase();
    const requiredRoles = required.map(r => r.toLowerCase());

    const hasRole = requiredRoles.includes(userRole);
    console.log('✅ Résultat de la vérification :', {
      userRole,
      requiredRoles,
      hasRole
    });

    return hasRole;
  }
}

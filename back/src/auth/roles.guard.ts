import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!required) return true;

    const { user } = ctx.switchToHttp().getRequest();

    console.log('🛡️ rôle reçu du JWT :', user?.role);
    console.log('🔐 rôles attendus pour la route :', required);

    return required.includes(user.role);
  }
}

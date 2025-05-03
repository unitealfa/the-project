import { SetMetadata } from '@nestjs/common';

/* Utilisation :  @Roles('Admin', 'responsable depot')  */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

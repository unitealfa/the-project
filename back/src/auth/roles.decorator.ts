import { SetMetadata } from '@nestjs/common';

// usage : @Roles('Super Admin', 'Admin')
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

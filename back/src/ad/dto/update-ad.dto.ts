import { PartialType } from '@nestjs/mapped-types';
import { CreateAdDto } from './create-ad.dto';
import { Type } from 'class-transformer';

export class UpdateAdDto extends PartialType(CreateAdDto) {
  @Type(() => String) // Ensure expiresAt is treated as a string
  expiresAt?: string;
}

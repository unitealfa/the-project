import { IsMongoId, IsEnum, IsOptional, IsInt, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdDto {
  @IsMongoId({ message: 'company doit être un ObjectId Mongo valide' })
  company!: string;

  @IsEnum(['image', 'video'], { message: 'type doit être "image" ou "video"' })
  type!: 'image' | 'video';

  @IsOptional()
  @Type(() => Number) // Transform string to number
  @IsInt({ message: 'duration doit être un entier' })
  duration?: number;

  @IsISO8601({}, { message: 'expiresAt doit être une date au format ISO 8601' })
  expiresAt!: string; // ISO date
}
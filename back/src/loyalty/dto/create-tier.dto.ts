// back/src/loyalty/dto/create-tier.dto.ts
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateTierDto {
  @IsNumber()
  points!: number;

  @IsString()
  reward!: string;

  @IsOptional()
  @IsString()
  image?: string;
}

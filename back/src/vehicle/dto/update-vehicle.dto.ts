import { IsMongoId, IsString, IsOptional, IsNumber, IsArray, IsEnum } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  license_plate?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsArray()
  @IsEnum(['normal', 'frigorifique'], { each: true })
  type?: string[];

  @IsOptional()
  @IsMongoId()
  chauffeur_id?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  livreur_id?: Types.ObjectId;
}
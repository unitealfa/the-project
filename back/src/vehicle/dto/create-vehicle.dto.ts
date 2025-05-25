import { IsNotEmpty, IsMongoId, IsString, IsOptional, IsNumber, IsArray, IsEnum } from 'class-validator';
import { Types } from 'mongoose';

export class CreateVehicleDto {
  @IsNotEmpty()
  @IsString()
  make: string;

  @IsNotEmpty()
  @IsString()
  model: string;

  @IsNotEmpty()
  @IsString()
  year: string;

  @IsNotEmpty()
  @IsString()
  license_plate: string;

  @IsNotEmpty()
  @IsNumber()
  capacity: number;

  @IsNotEmpty()
  @IsArray()
  @IsEnum(['normal', 'frigorifique'], { each: true })
  type: string[];

  @IsOptional()
  @IsMongoId()
  chauffeur_id?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  livreur_id?: Types.ObjectId;

  // depot_id will be automatically assigned based on the admin's depot
}
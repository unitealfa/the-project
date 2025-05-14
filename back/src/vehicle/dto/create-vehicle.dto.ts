import { IsNotEmpty, IsMongoId, IsString, IsOptional } from 'class-validator';
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

  @IsMongoId()
  @IsNotEmpty()
  chauffeur_id: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  livreur_id: Types.ObjectId;

  // depot_id will be automatically assigned based on the admin's depot
}
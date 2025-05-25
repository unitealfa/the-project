import {
  IsNotEmpty,
  IsMongoId,
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsEnum,
  IsIn,
  IsMilitaryTime,
  ValidateNested,
  IsDefined,
  IsNotEmptyObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

// Sous-objet shift
export class ShiftDto {
  @IsString()
  @IsMilitaryTime()
  start: string;

  @IsString()
  @IsMilitaryTime()
  end: string;
}

// Sous-objet working_days
export class WorkingDayDto {
  @IsString()
  @IsIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
  day: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => ShiftDto)
  @IsNotEmptyObject()
  shift: ShiftDto;
}

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

  // Les horaires par jour
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingDayDto)
  working_days?: WorkingDayDto[];
}

import { IsNotEmpty, IsMongoId, IsString, IsOptional, IsNumber, IsArray, IsEnum, IsDefined, IsNotEmptyObject, ValidateNested, IsIn, IsMilitaryTime } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

// Sous-objet shift
export class ShiftDto {
  @IsMilitaryTime()
  start: string;

  @IsMilitaryTime()
  end: string;
}

// Sous-objet working_days
export class WorkingDayDto {
  @IsString()
  @IsIn(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'])
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
  marque: string;

  @IsNotEmpty()
  @IsString()
  modele: string;

  @IsNotEmpty()
  @IsString()
  matricule: string;

  @IsNotEmpty()
  @IsString()
  chauffeur: string;

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
  workingDays: WorkingDayDto[];
}

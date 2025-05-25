import { IsString, IsNumber, IsArray, IsEnum, IsDefined, IsNotEmptyObject, ValidateNested, IsIn, IsMilitaryTime, IsOptional, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

// ShiftDto pour une plage horaire
export class ShiftDto {
  @IsMilitaryTime()
  start: string;

  @IsMilitaryTime()
  end: string;
}

// WorkingDayDto pour un jour de travail
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

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  marque?: string;

  @IsOptional()
  @IsString()
  modele?: string;

  @IsOptional()
  @IsString()
  matricule?: string;

  @IsOptional()
  @IsString()
  chauffeur?: string;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingDayDto)
  workingDays?: WorkingDayDto[];
}

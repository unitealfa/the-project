import { IsMongoId, IsString, IsOptional, IsArray, IsIn, IsMilitaryTime, ValidateNested, IsDefined, IsNotEmptyObject } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

// ShiftDto pour une plage horaire
export class ShiftDto {
  @IsString()
  @IsMilitaryTime()
  start: string;

  @IsString()
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
  @IsMongoId()
  chauffeur_id?: Types.ObjectId;

  @IsOptional()
  @IsMongoId()
  livreur_id?: Types.ObjectId;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingDayDto)
  working_days?: WorkingDayDto[];
}

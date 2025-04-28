import { IsString, IsEmail } from 'class-validator';

export class CreateAdminDto {
  @IsString() nom: string;
  @IsString() prenom: string;
  @IsEmail() email: string;
  @IsString() password: string;
  @IsString() num: string;
}

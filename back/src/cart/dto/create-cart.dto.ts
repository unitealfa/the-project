import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateCartItemDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  clientId?: string;
}

export class UpdateCartItemDto {
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
} 
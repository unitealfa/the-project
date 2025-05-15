import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class CreateOrderItemDto {
  @IsNotEmpty() productId: string;
  @IsNotEmpty() productName: string;
  @IsNotEmpty() prix_detail: number;
  @IsNotEmpty() quantity: number;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsArray()
  items: CreateOrderItemDto[];

  @IsNotEmpty()
  @IsNumber()
  total: number;
}

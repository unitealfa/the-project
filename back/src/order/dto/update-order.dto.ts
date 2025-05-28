// back/src/orders/dto/update-order.dto.ts

import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;
}

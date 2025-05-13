import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class AddToWishlistDto {
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId;
}

export class RemoveFromWishlistDto {
  @IsNotEmpty()
  @IsMongoId()
  productId: Types.ObjectId;
} 
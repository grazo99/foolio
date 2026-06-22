import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { AssetType } from '@prisma/client';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  ticker: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(AssetType)
  type: AssetType;
}

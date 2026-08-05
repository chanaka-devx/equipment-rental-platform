import { IsString, IsNumber, IsInt, IsUUID, IsOptional, Min, IsArray } from 'class-validator';

export class CreateEquipmentDto {
  @IsString() name: string;
  @IsString() description: string;
  @IsNumber() rentalPrice: number;
  @IsNumber() deposit: number;
  @IsInt() @Min(0) stockQuantity: number;
  @IsUUID() categoryId: string;
  
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional() specifications?: Record<string, any>;
  
  @IsOptional()
  @IsString()
  qrCodeUrl?: string;
}
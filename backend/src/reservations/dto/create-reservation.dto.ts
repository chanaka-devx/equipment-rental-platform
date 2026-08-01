import { IsDateString, IsInt, IsUUID, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ReservationItemDto {
  @IsUUID()
  equipmentId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateReservationDto {
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @ValidateNested({ each: true }) @Type(() => ReservationItemDto) items: ReservationItemDto[];
}
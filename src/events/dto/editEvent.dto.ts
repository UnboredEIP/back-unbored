import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ArrayMinSize,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class EditEventDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly name: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly address: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ApiProperty()
  readonly categories: string[];

  @IsOptional()
  @ApiProperty()
  @IsDateString()
  readonly start_date: Date;

  @IsOptional()
  @ApiProperty()
  readonly description: string;
}

import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsEmail,
  IsArray,
  IsDateString,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';

export class editEventDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  readonly address: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  readonly categories: string[];
}

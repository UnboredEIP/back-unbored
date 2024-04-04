import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
  ValidateNested,
} from 'class-validator';

class AvatarStyle {
  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly head: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly body: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly pants: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly shoes: string;
}

export class UpdateAvatarDto {
  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => AvatarStyle)
  readonly style: AvatarStyle;
}

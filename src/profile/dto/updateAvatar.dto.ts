import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class UpdateAvatarDto {
  style: {
    readonly head: string;
    readonly body: string;
    readonly pants: string;
    readonly shoes: string;
  };
}

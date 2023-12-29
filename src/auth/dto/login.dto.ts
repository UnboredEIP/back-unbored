import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please enter a correct email' })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;
}

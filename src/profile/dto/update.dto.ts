import { IsEnum, IsNotEmpty, IsString, IsEmail, IsDateString, IsOptional } from "class-validator";
import { Gender } from "../../auth/schemas/user.schema";

export class UpdateDto {
    @IsOptional()
    @IsString()
    readonly username: string;

    @IsOptional()
    @IsEmail({}, { message: "Please enter a correct email"})
    readonly email: string;

    @IsOptional()
    readonly role: string;

    @IsOptional()
    @IsEnum(Gender, { message : "Please enter a correct gender"})
    readonly gender: Gender;

    @IsOptional()
    @IsString()
    readonly number: string;

    @IsOptional()
    @IsString()
    readonly password: string;

    @IsOptional()
    @IsDateString()
    readonly birthdate: string;
}
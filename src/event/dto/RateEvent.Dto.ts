import { IsEnum, IsNotEmpty, IsString, IsEmail, IsArray, IsDateString, ArrayMinSize, IsOptional } from "class-validator";

export class rateEventDto {
    @IsNotEmpty()
    @IsString()
    readonly stars: string;

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    readonly comments: string;
}
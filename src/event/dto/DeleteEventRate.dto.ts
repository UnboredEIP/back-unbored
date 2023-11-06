import { IsArray, ArrayMinSize, IsString, IsNotEmpty } from "class-validator";

export class removeEventRateDto {
    @IsString()
    @IsNotEmpty()
    readonly rateId: string;
}
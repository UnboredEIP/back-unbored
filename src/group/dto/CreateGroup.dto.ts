import { IsNotEmpty, IsString } from "class-validator";

export class createGroupDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;
}
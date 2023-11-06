import { IsNotEmpty, IsString } from "class-validator";

export class sendMessageDto {
    @IsNotEmpty()
    @IsString()
    readonly message: string;
}
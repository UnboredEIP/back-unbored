import { IsArray, ArrayMinSize } from "class-validator";

export class AddEventDto {
    @IsArray()
    @ArrayMinSize(1)
    readonly events: string[];
}
import { IsArray, ArrayMinSize } from "class-validator";

export class DeleteEventDto {
    @IsArray()
    @ArrayMinSize(1)
    readonly events: string[];
}
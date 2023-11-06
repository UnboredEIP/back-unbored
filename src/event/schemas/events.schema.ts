import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

@Schema({versionKey: false})
export class Events extends Document {
    @Prop({unique: [true, 'Duplicated activities entered']})
    name: string;

    @Prop()
    address: string;

    @Prop()
    rate: {
        id: string;
        stars: string;
        comments: string;
    }[];

    @Prop()
    pictures: {
        id: string;
        userId: string;
    }[];

    @Prop()
    categories: string[];
}

export const EventSchema = SchemaFactory.createForClass(Events);
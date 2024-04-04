import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class Events extends Document {
  @Prop()
  name: string;

  @Prop()
  address: string;

  @Prop()
  description: string;

  @Prop()
  rate: {
    id: string;
    stars: string;
    comments: string;
  }[];

  @Prop()
  defaultPicture: string[];

  @Prop()
  pictures: {
    id: string;
    userId: string;
  }[];

  @Prop()
  categories: string[];

  @Prop()
  start_date: Date;

  @Prop()
  end_date: Date;

  @Prop()
  creator: string;

  @Prop()
  private: boolean;

  @Prop()
  registrants: string[];

  @Prop()
  attendees: string[];

  @Prop()
  price: string;

  @Prop()
  age: string;

  @Prop()
  phone: string;

  @Prop()
  email: string;

  @Prop({ default: false })
  end: boolean;

  @Prop()
  rewards: string[];
}

export const EventsSchema = SchemaFactory.createForClass(Events);

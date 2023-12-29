import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Gender {
  HOMME = 'Homme',
  FEMME = 'Femme',
  AUTRE = 'Autre',
}

export enum Role {
  USER = 'User',
  EVENTADDER = 'EventAdder',
}

@Schema({ versionKey: false })
export class User extends Document {
  @Prop({ unique: [true, 'Duplicated username entered'] })
  username: string;

  @Prop({ unique: [true, 'Duplicated email entered'] })
  email: string;

  @Prop()
  password: string;

  @Prop()
  role: string;

  @Prop({ unique: [true, 'number already used'] })
  number: string;

  @Prop()
  gender: Gender;

  @Prop()
  birthdate: Date;

  @Prop()
  preferences: string[];

  @Prop()
  reservations: string[];

  @Prop({ type: Object })
  style: {
    head: string;
    body: string;
    pants: string;
    shoes: string;
  };

  @Prop({ type: Object })
  unlockedStyle: {
    head: string[];
    body: string[];
    pants: string[];
    shoes: string[];
  };

  @Prop()
  rates: {
    event: string;
    idRate: string;
    comment: string;
    stars: string;
  }[];

  @Prop()
  pictures: {
    id: string;
    eventId: string;
  }[];

  @Prop()
  groups: {
    _id: string;
    joinedAt: Date;
  }[];

  @Prop()
  invitations: {
    _id: string;
    createdAt: Date;
  }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
// UserSchema.index({'invitations.createdAt': 1}, {expireAfterSeconds: 60});

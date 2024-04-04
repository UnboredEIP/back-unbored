import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Gender {
  HOMME = 'Homme',
  FEMME = 'Femme',
  AUTRE = 'Autre',
}

export enum Role {
  USER = 'User',
  PRO = 'Pro',
  ADMIN = 'Admin',
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
  resetToken: string;

  @Prop({ type: Object })
  otp: {
    value: string;
    createdAt: Date;
  };

  @Prop({ required: false })
  profilePhoto: string;

  @Prop({ required: false })
  description: string;

  @Prop()
  role: string;

  @Prop()
  gender: Gender;

  @Prop()
  birthdate: Date;

  @Prop()
  preferences: string[];

  @Prop()
  qrCodeDataUrl: string;

  @Prop()
  reservations: string[];

  @Prop({
    type: Object,
    default: { head: '0', body: '0', pants: '0', shoes: '0' },
  })
  style: {
    head: string;
    body: string;
    pants: string;
    shoes: string;
  };

  @Prop({
    type: Object,
    default: { head: ['0'], body: ['0'], pants: ['0'], shoes: ['0'] },
  })
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
  friends: {
    _id: string;
  }[];

  @Prop()
  groups: {
    _id: string;
    joinedAt: Date;
  }[];

  @Prop({ type: Object, default: { groups: [], friends: [] } })
  invitations: {
    groups: {
      _id: string;
      createdAt: Date;
    }[];
    friends: {
      _id: string;
      createdAt: Date;
    }[];
  };

  @Prop([String])
  favorites: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

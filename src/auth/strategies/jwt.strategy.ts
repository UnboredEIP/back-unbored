import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from '../schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: '123456',
    });
  }

  async validate(payload: any) {
    const { id } = payload;
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .select('-__v');
    return user;
  }
}

import {
  ConflictException,
  HttpCode,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { UpdateDto } from './dto/update.dto';
import { UpdateAvatarDto } from './dto/updateAvatar.dto';
import { Types } from 'mongoose';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}
  async profile(user: User): Promise<{ status: HttpStatus; user: User }> {
    return { status: HttpStatus.OK, user: user as User };
  }

  async getprofilebyid(
    profilId: string,
  ): Promise<{ status: HttpStatus; user: User }> {
    if (!Types.ObjectId.isValid(profilId))
      throw new NotFoundException('Invalid Id');
    const getUser = await this.userModel
      .findById(profilId)
      .select('-password')
      .select('-__v');
    return { status: HttpStatus.OK, user: getUser as User };
  }

  async UpdateUser(
    id: string,
    updateUser: UpdateDto,
  ): Promise<{ status: HttpStatus; user: User }> {
    if (updateUser.role) {
      throw new UnauthorizedException('Role is cannot be modified');
    }
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUser, { new: true })
        .select('-password')
        .select('-__v');
      return { status: HttpStatus.OK, user: updatedUser as User };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Already used key');
      }
    }
  }

  async UserActualAvatar(
    user: User,
  ): Promise<{ status: HttpStatus; style: NonNullable<unknown> }> {
    return { status: HttpStatus.OK, style: user.style as NonNullable<unknown> };
  }

  async UserAvatars(
    user: User,
  ): Promise<{ status: HttpStatus; unlockedStyles: NonNullable<unknown> }> {
    return { status: HttpStatus.OK, unlockedStyles: user.unlockedStyle };
  }

  async ChangeAvatar(
    id: string,
    updateAvatarDto: UpdateAvatarDto,
  ): Promise<{ status: HttpStatus; style: NonNullable<unknown> }> {
    const avatarUpdate = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateAvatarDto },
      { new: true },
    );
    return {
      status: HttpStatus.OK,
      style: avatarUpdate.style as NonNullable<unknown>,
    };
  }
}

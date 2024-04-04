import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../auth/schemas/user.schema';
import { UpdateDto } from './dto/update.dto';
import { UpdateAvatarDto } from './dto/updateAvatar.dto';
import { QueryUsersDto } from './dto/queryUsers.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async getAll(
    query: QueryUsersDto,
  ): Promise<{ statusCode: HttpStatus; users: User[] }> {
    const queries = {};
    Object.keys(query).forEach((key) => {
      if (key === 'email' || key === 'username')
        queries[key] = { $regex: query[key], $options: 'i' };
    });
    // Correspondance complete :
    const allUsers = await this.userModel
      .find(queries)
      .select('-password')
      .select('-__v');
    // Correspondance partiel :
    // const allUsers = await this.userModel.find({
    //     $or: Object.keys(options).map(key => ({
    //         [key]: {$regex: options[key], $options: "i"}
    //     }))
    // }).select('-password').select('-__v');
    return { statusCode: HttpStatus.OK, users: allUsers };
  }

  async profile(user: User): Promise<{ statusCode: HttpStatus; user: User }> {
    return { statusCode: HttpStatus.OK, user: user };
  }

  async getprofilebyid(
    profilId: string,
  ): Promise<{ statusCode: HttpStatus; user: User }> {
    if (!Types.ObjectId.isValid(profilId))
      throw new NotFoundException('Invalid Id');
    const getUser = await this.userModel
      .findById(profilId)
      .select('-password')
      .select('-__v');
    return { statusCode: HttpStatus.OK, user: getUser as User };
  }

  async UpdateUser(
    id: string,
    updateUser: UpdateDto,
  ): Promise<{ statusCode: HttpStatus; user: User }> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUser, { new: true })
        .select('-password')
        .select('-__v');
      return { statusCode: HttpStatus.OK, user: updatedUser as User };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Already used key');
      }
    }
  }

  async UserActualAvatar(
    user: User,
  ): Promise<{ statusCode: HttpStatus; style: Object }> {
    return { statusCode: HttpStatus.OK, style: user.style as Object };
  }

  async UserAvatars(
    user: User,
  ): Promise<{ statusCode: HttpStatus; unlockedStyles: Object }> {
    return { statusCode: HttpStatus.OK, unlockedStyles: user.unlockedStyle };
  }

  async ChangeAvatar(
    id: string,
    updateAvatarDto: UpdateAvatarDto,
  ): Promise<{ statusCode: HttpStatus; style: Object }> {
    const updateQuery = {
      $set: {},
    };

    Object.keys(updateAvatarDto.style).forEach((key) => {
      updateQuery.$set[`style.${key}`] = updateAvatarDto.style[key];
    });

    const avatarUpdate = await this.userModel.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true },
    );
    return { statusCode: HttpStatus.OK, style: avatarUpdate.style as Object };
  }

  async uploadProfilePicture(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { _id: userId },
        { profilePhoto: file.filename },
        { new: true },
      );
      return { statusCode: HttpStatus.OK, message: 'Image uploaded !' };
    } catch (err) {
      throw new BadRequestException('Bad request');
    }
  }
}

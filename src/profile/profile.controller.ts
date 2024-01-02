import {
  Controller,
  Get,
  UseGuards,
  Req,
  Put,
  Body,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateDto } from './dto/update.dto';
import { UpdateAvatarDto } from './dto/updateAvatar.dto';
import { ProfileService } from './profile.service';
import { User } from 'src/auth/schemas/user.schema';
import { HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryUsersDto } from './dto/queryUsers.dto';

@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @UseGuards(JwtGuard)
  @Get('/all')
  async getAll(
    @Query() query: QueryUsersDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ status: HttpStatus; users: User[] }> {
    res.status(HttpStatus.OK);
    return this.profileService.getAll(query);
  }

  @UseGuards(JwtGuard)
  @Get('/')
  async profile(
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<{ status: HttpStatus; user: User }> {
    res.status(HttpStatus.OK);
    return this.profileService.profile(req.user);
  }

  @UseGuards(JwtGuard)
  @Post('/')
  async getprofilebyid(
    @Query('id') id,
    @Res({ passthrough: true }) res,
  ): Promise<{ status: HttpStatus; user: User }> {
    res.status(HttpStatus.OK);
    return this.profileService.getprofilebyid(id);
  }

  @UseGuards(JwtGuard)
  @Put('/update')
  async update(
    @Req() req,
    @Body() updateUser: UpdateDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ status: HttpStatus; user: User }> {
    res.status(HttpStatus.OK);
    return this.profileService.UpdateUser(req.user.id, updateUser);
  }

  @UseGuards(JwtGuard)
  @Get('/avatar')
  async avatar(
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<{ status: HttpStatus; style: Object }> {
    res.status(HttpStatus.OK);
    return this.profileService.UserActualAvatar(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('/avatars')
  async avatars(
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<{ status: HttpStatus; unlockedStyles: Object }> {
    res.status(HttpStatus.OK);
    return this.profileService.UserAvatars(req.user);
  }

  @UseGuards(JwtGuard)
  @Post('/avatar')
  async changeAvatar(
    @Req() req,
    @Body() updateAvatarDto: UpdateAvatarDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ status: HttpStatus; style: Object }> {
    res.status(HttpStatus.OK);
    return this.profileService.ChangeAvatar(req.user.id, updateAvatarDto);
  }

  @UseGuards(JwtGuard)
  @Post('/profilepicture')
  @UseInterceptors(FileInterceptor('file', { dest: './data/images' }))
  async uploadUnboredImages(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' })],
      }),
    )
    file: Express.Multer.File,
    @Res({ passthrough: true }) res,
  ) {
    res.status(HttpStatus.OK);
    try {
      console.log(file);
      return await this.profileService.uploadProfilePicture(req.user.id, file);
      // return await this.eventService.uploadUnboredImage(req.user.id, id, file)
    } catch (err) {
      const fs = require('fs');
      fs.unlinkSync(file.path);
      throw new BadRequestException('Bad request');
    }
  }
}

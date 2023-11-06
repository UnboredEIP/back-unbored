import { Controller, Get, UseGuards, Req, Put, Body, Post, Query } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateDto } from './dto/update.dto';
import { UpdateAvatarDto } from './dto/updateAvatar.dto';
import { ProfileService } from './profile.service';
import { User } from 'src/auth/schemas/user.schema';
import { HttpStatus } from '@nestjs/common';

@Controller('profile')
export class ProfileController {

    constructor(private profileService: ProfileService) {}

    @UseGuards(JwtGuard)
    @Get('/')
    async profile(@Req() req) : Promise <{status: HttpStatus, user: User}> {
        return this.profileService.profile(req.user);
    }

    @UseGuards(JwtGuard)
    @Post('/')
    async getprofilebyid(@Query('id') id) : Promise <{status: HttpStatus, user: User}> {
        return this.profileService.getprofilebyid(id);
    }

    @UseGuards(JwtGuard)
    @Put('/update')
    async update(@Req() req, @Body() updateUser : UpdateDto) : Promise<{status: HttpStatus, user: User}> {
        return this.profileService.UpdateUser(req.user.id, updateUser);
    }

    @UseGuards(JwtGuard)
    @Get('/avatar')
    async avatar(@Req() req) : Promise<{status: HttpStatus, style: Object}> {
        return this.profileService.UserActualAvatar(req.user);
    }

    @UseGuards(JwtGuard)
    @Get('/avatars')
    async avatars(@Req() req) : Promise<{status: HttpStatus, unlockedStyles: Object}> {
        return this.profileService.UserAvatars(req.user);
    }

    @UseGuards(JwtGuard)
    @Post('/avatar')
    async changeAvatar(@Req() req, @Body() updateAvatarDto : UpdateAvatarDto) : Promise<{status: HttpStatus, style: Object}> {
        return this.profileService.ChangeAvatar(req.user.id, updateAvatarDto);
    }
}

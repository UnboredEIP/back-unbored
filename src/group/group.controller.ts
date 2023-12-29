import {
  Controller,
  Get,
  UseGuards,
  Req,
  HttpStatus,
  Post,
  Body,
  Query,
  Delete,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { createGroupDto } from './dto/CreateGroup.dto';
import { sendMessageDto } from './dto/SendMessage.dto';
import { GroupService } from './group.service';
import { Groups } from './schemas/group.schema';

@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @UseGuards(JwtGuard)
  @Get('/')
  async showGroup(
    @Req() req,
  ): Promise<{ status: HttpStatus; groups: NonNullable<unknown>[] }> {
    return this.groupService.showGroups(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('/show')
  async showGroupWithId(
    @Query('group_id') id,
  ): Promise<{ status: HttpStatus; groups: NonNullable<unknown> }> {
    return this.groupService.showGroupWithId(id);
  }

  @UseGuards(JwtGuard)
  @Get('/invitations')
  async showInvitation(
    @Req() req,
  ): Promise<{ status: HttpStatus; invitations: NonNullable<unknown>[] }> {
    return this.groupService.showInvitation(req.user);
  }

  @UseGuards(JwtGuard)
  @Post('/create')
  async createGroup(
    @Req() req,
    @Body() createGroupDto: createGroupDto,
  ): Promise<{ status: HttpStatus; group: Groups }> {
    return this.groupService.createGroup(req.user, createGroupDto);
  }

  @UseGuards(JwtGuard)
  @Post('/invite')
  async inviteInGroup(
    @Query('group_id') id,
    @Query('user_id') userId,
  ): Promise<{ status: HttpStatus; message: string }> {
    return this.groupService.inviteInGroup(id, userId);
  }

  @UseGuards(JwtGuard)
  @Post('/accept')
  async acceptInvitation(
    @Query('group_id') id,
    @Req() req,
  ): Promise<{ status: HttpStatus; message: string }> {
    return this.groupService.acceptInvitation(req.user, id);
  }

  @UseGuards(JwtGuard)
  @Delete('/delete')
  async deleteInvitation(
    @Query('group_id') id,
    @Req() req,
  ): Promise<{ status: HttpStatus; message: string }> {
    return this.groupService.deleteInvitation(req.user, id);
  }

  @UseGuards(JwtGuard)
  @Post('/message')
  async sendMessage(
    @Query('group_id') id,
    @Req() req,
    @Body() sendMessageDto: sendMessageDto,
  ): Promise<{ status: HttpStatus; message: string }> {
    return this.groupService.sendMessage(req.user, id, sendMessageDto);
  }
}

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Groups } from './schemas/group.schema';
import { HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
import { createGroupDto } from './dto/CreateGroup.dto';
import { sendMessageDto } from './dto/SendMessage.dto';

@Injectable()
export class GroupService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Groups.name)
    private groupModel: Model<Groups>,
  ) {}

  async showGroups(
    user: User,
  ): Promise<{ status: HttpStatus; groups: NonNullable<unknown>[] }> {
    return { status: HttpStatus.OK, groups: user.groups };
  }

  async showGroupWithId(
    id: string,
  ): Promise<{ status: HttpStatus; groups: NonNullable<unknown> }> {
    const group = await this.groupModel.findById(id);
    if (!group) throw new NotFoundException('Group not found');
    return { status: HttpStatus.OK, groups: group };
  }

  async showInvitation(
    user: User,
  ): Promise<{ status: HttpStatus; invitations: NonNullable<unknown>[] }> {
    return { status: HttpStatus.OK, invitations: user.invitations };
  }

  async createGroup(
    user: User,
    createGroupDto: createGroupDto,
  ): Promise<{ status: HttpStatus; group: Groups }> {
    const { name } = createGroupDto;
    try {
      const group = await this.groupModel.create({
        name,
        leader: user._id,
      });
      const newGroup = {
        _id: group._id,
        joinedAt: new Date(),
      };
      await this.userModel.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { groups: newGroup } },
      );
      return { status: HttpStatus.CREATED, group: group };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Duplicated Key');
      }
    }
  }

  async inviteInGroup(
    groupId: string,
    userId: string,
  ): Promise<{ status: HttpStatus; message: string }> {
    const group = await this.groupModel.findById(groupId);
    const user = await this.userModel.findById(userId);
    if (!group) throw new NotFoundException('Group not found');
    if (!user) {
      throw new NotFoundException('could not find this user');
    }
    const exists = user.invitations.some(
      (invitations) => invitations._id === groupId,
    );
    const newInvitations = {
      _id: groupId,
      createdAt: new Date(),
    };
    if (exists) {
      return {
        status: HttpStatus.CONFLICT,
        message: 'user already got an invitation !',
      };
    } else if (group.members.includes(userId) === true) {
      return {
        status: HttpStatus.CONFLICT,
        message: 'user already in this group !',
      };
    } else {
      await this.userModel.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { invitations: newInvitations } },
      );
      return {
        status: HttpStatus.OK,
        message: 'invitation successfully sended !',
      };
    }
  }

  async acceptInvitation(
    user: User,
    groupId: string,
  ): Promise<{ status: HttpStatus; message: string }> {
    const exists = user.invitations.some(
      (invitations) => invitations._id === groupId,
    );
    if (!exists) {
      return {
        status: HttpStatus.NOT_ACCEPTABLE,
        message: 'user did not had an invitation from this group',
      };
    } else {
      const newGroup = {
        _id: groupId,
        joinedAt: new Date(),
      };
      await this.groupModel.findByIdAndUpdate(groupId, {
        $addToSet: { members: user._id },
      });
      await this.userModel.findByIdAndUpdate(user._id, {
        $addToSet: { groups: newGroup },
      });
      await this.userModel.findByIdAndUpdate(
        user._id,
        { $pull: { invitations: { _id: groupId } } },
        { new: true },
      );
      const hehe = await this.userModel.findOne({ _id: user.id });
      return { status: HttpStatus.OK, message: 'Successfully joined group !' };
    }
  }

  async deleteInvitation(
    user: User,
    groupId: string,
  ): Promise<{ status: HttpStatus; message: string }> {
    const exists = user.invitations.some(
      (invitations) => invitations._id === groupId,
    );
    if (!exists)
      return {
        status: HttpStatus.NOT_ACCEPTABLE,
        message: 'user did not had an invitation from this group',
      };
    else {
      await this.userModel.findByIdAndUpdate(user._id, {
        $pull: { invitations: { _id: groupId } },
      });
      return {
        status: HttpStatus.OK,
        message: 'successsfully rejected invitation !',
      };
    }
  }

  async sendMessage(
    user: User,
    groupdId: string,
    sendMessageDto: sendMessageDto,
  ): Promise<{ status: HttpStatus; message: string }> {
    const { message } = sendMessageDto;
    const group = await this.groupModel.findById(groupdId);
    if (!group) throw new NotFoundException('Group not found !');
    const exists = user.groups.some((groups) => groups._id === groupdId);
    if (!exists)
      throw new ConflictException(
        'You are not able to send a message to this group !',
      );
    const newMessage = {
      message: message,
      _id: user.id,
      sendAt: new Date(),
    };
    await this.groupModel.findByIdAndUpdate(groupdId, {
      $addToSet: { messages: newMessage },
    });
    return { status: HttpStatus.OK, message: message + ' has been posted !' };
  }
}

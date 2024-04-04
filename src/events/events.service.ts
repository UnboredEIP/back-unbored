import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Events } from './schemas/events.schema';
import { EditEventDto } from './dto/editEvent.dto';
import { CreateEventDto } from './dto/createEvent.dto';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Events.name)
    private eventModel: Model<Events>,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async listAllEvent(
    id: string,
  ): Promise<{ statusCode: HttpStatus; events: Object[] }> {
    const Events = await this.eventModel.find({
      $or: [{ private: true, creator: id }, { private: false }],
    });
    return { statusCode: HttpStatus.OK, events: Events };
  }

  async getEventById(
    eventId: string,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Invalid Id');
    }
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Invalid Id');
    }
    return { statusCode: HttpStatus.OK, event: event };
  }

  async createUnboredPrivateEvent(
    id: string,
    createEventDto: CreateEventDto,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    const { name, categories, address, description, start_date, end_date } =
      createEventDto;
    const event = await this.eventModel.create({
      name,
      categories,
      description,
      address,
      start_date,
      end_date,
      creator: id,
      private: true,
    });
    return { statusCode: HttpStatus.CREATED, event: event };
  }

  async createUnboredEvent(
    id: string,
    createEventDto: CreateEventDto,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    const {
      name,
      categories,
      description,
      address,
      start_date,
      end_date,
      price,
      age,
      phone,
      email,
      rewards,
    } = createEventDto;
    const duplicatedEvent = await this.eventModel.find({ name });
    for (const ev in duplicatedEvent) {
      if (duplicatedEvent[ev].private === false) {
        throw new ConflictException('Duplicated Key');
      }
    }
    if (end_date && end_date < start_date)
      throw new BadRequestException('Bad Request');

    const event = await this.eventModel.create({
      name,
      categories,
      address,
      description,
      start_date,
      end_date,
      creator: id,
      price,
      phone,
      age,
      email,
      rewards,
      private: false,
    });
    return { statusCode: HttpStatus.CREATED, event: event };
  }
  async deleteUnboredEvent(
    actualId: string,
    eventId: string,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Invalid Id');
    }
    const exists = await this.eventModel.findById(eventId);
    if (!exists) {
      throw new NotFoundException('Could not find this event');
    }
    if (actualId === exists.creator) {
      for (const img of exists.pictures) {
        await this.userModel.findOneAndUpdate(
          { _id: img.userId },
          { $pull: { pictures: { id: img.id } } },
        );
        await this.deleteImage(img.id);
      }
      await this.eventModel.deleteOne({ _id: eventId });
    }
    return { statusCode: HttpStatus.OK, message: 'Successfully deleted !' };
  }

  async editUnboredEvent(
    actualId: string,
    editEventDto: EditEventDto,
    eventId: string,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    const { name } = editEventDto;
    let event: Events;
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Invalid Id');
    }
    const findId = await this.eventModel.findById(eventId);
    if (!findId) throw new NotFoundException('Event not existing');
    const duplicatedEvent = await this.eventModel.findOne({ name });
    if (duplicatedEvent && duplicatedEvent._id.toString() !== eventId)
      throw new ConflictException('Duplicated Key');
    if (actualId === findId.creator)
      event = await this.eventModel.findByIdAndUpdate(eventId, editEventDto, {
        new: true,
      });
    return { statusCode: HttpStatus.OK, event: event };
  }

  async deleteImage(filename: string): Promise<boolean> {
    try {
      const fs = require('fs');
      const imagePath = `./data/images/${filename}`;
      if (fs.existsSync(imagePath)) {
        await fs.unlinkSync(imagePath);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  async checkInEvent(
    userId: string,
    eventId: string,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Invalid Id');
    }
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Could not find this event');
    }
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('Could not find this user');
    }
    if (!event.registrants.includes(userId)) {
      throw new BadRequestException('Not registered');
    }
    if (event.attendees.includes(userId)) {
      throw new BadRequestException('Already checked in');
    }
    await this.eventModel.findByIdAndUpdate(
      eventId,
      { $addToSet: { attendees: userId } },
      { new: true },
    );
    return { statusCode: HttpStatus.OK, message: 'Checked in' };
  }
}

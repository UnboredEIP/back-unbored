import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../auth/schemas/user.schema';
import { Model, Types } from 'mongoose';
import { AddEventDto } from './dto/AddEvent.dto';
import { NotFoundException } from '@nestjs/common';
import { DeleteEventDto } from './dto/RemoveEvent.dto';
import { Events } from './schemas/events.schema';
import { createEventDto } from './dto/CreateEvent.dto';
import { editEventDto } from './dto/EditEvent.dto';
import { rateEventDto } from './dto/RateEvent.Dto';
import { HttpStatus } from '@nestjs/common';
import { removeEventRateDto } from './dto/DeleteEventRate.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Events.name)
    private eventModel: Model<Events>,
  ) {}

  async showEvent(
    user: User,
  ): Promise<{ statusCode: HttpStatus; reservations: string[] }> {
    return { statusCode: HttpStatus.OK, reservations: user.reservations };
  }

  async listAllEvent(): Promise<{ statusCode: HttpStatus; events: Object[] }> {
    const Events = await this.eventModel.find();
    return { statusCode: HttpStatus.OK, events: Events };
  }

  async addEvent(
    userId: string,
    addEvent: AddEventDto,
  ): Promise<{ statusCode: HttpStatus; reservations: string[] }> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { reservations: { $each: addEvent.events } } },
      { new: true },
    );
    return {
      statusCode: HttpStatus.OK,
      reservations: updatedUser.reservations,
    };
  }

  async removeEvent(
    userId: string,
    deleteEvent: DeleteEventDto,
  ): Promise<{ statusCode: HttpStatus; reservations: string[] }> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { reservations: { $in: deleteEvent.events } } },
      { new: true },
    );
    return {
      statusCode: HttpStatus.OK,
      reservations: updatedUser.reservations,
    };
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

  async createUnboredEvent(
    createEventDto: createEventDto,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    const { name, categories, address, date } = createEventDto;
    const duplicatedEvent = await this.eventModel.findOne({ name });
    if (duplicatedEvent) throw new ConflictException('Duplicated Key');
    const event = await this.eventModel.create({
      name,
      categories,
      address,
      date,
    });
    return { statusCode: HttpStatus.CREATED, event: event };
  }

  async deleteUnboredEvent(
    eventId: string,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Invalid Id');
    }
    const exists = await this.eventModel.findById(eventId);
    if (!exists) {
      throw new NotFoundException('Could not find this event');
    }
    await this.eventModel.deleteOne({ _id: eventId });
    return { statusCode: HttpStatus.OK, message: 'Succefully deleted !' };
  }

  async editUnboredEvent(
    editEventDto: editEventDto,
    eventId: string,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    const { name } = editEventDto;
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Invalid Id');
    }
    const findId = await this.eventModel.findById(eventId);
    if (!findId) throw new NotFoundException('Event not existing');
    const duplicatedEvent = await this.eventModel.findOne({ name });
    if (duplicatedEvent) throw new ConflictException('Duplicated Key');
    const event = await this.eventModel.findByIdAndUpdate(
      eventId,
      editEventDto,
      { new: true },
    );
    return { statusCode: HttpStatus.OK, event: event };
  }

  async addUnboredRateEvent(
    eventId: string,
    rateEventDto: rateEventDto,
    userId: string,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    const newID = new Types.ObjectId();
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Invalid Id');
    }
    const rateEvent = {
      stars: rateEventDto.stars,
      comments: rateEventDto.comments,
      id: newID,
    };
    const rateEventForUser = {
      idRate: newID,
      event: eventId,
      stars: rateEventDto.stars,
      comments: rateEventDto.comments,
    };
    const updateRate = await this.eventModel.findByIdAndUpdate(
      eventId,
      { $addToSet: { rate: rateEvent } },
      { new: true },
    );
    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { rates: rateEventForUser } },
      { new: true },
    );
    if (!updateRate) {
      throw new NotFoundException('Event not found');
    }
    return { statusCode: HttpStatus.OK, event: updateRate };
  }

  async deleteUnboredRate(
    userId: string,
    removeEventRateDto: removeEventRateDto,
  ): Promise<{ statusCode: HttpStatus; rates: Object }> {
    const hehe1 = await this.userModel.findById(userId);
    const cc = hehe1.rates.find(
      (rate) => rate.idRate.toString() === removeEventRateDto.rateId.toString(),
    );
    if (!cc) {
      throw new NotFoundException('Could not find this rate');
    }
    const test = new Types.ObjectId(removeEventRateDto.rateId);

    const user = await this.userModel.findOneAndUpdate(
      { _id: userId },
      { $pull: { rates: { idRate: test } } },
      { new: true },
    );
    await this.eventModel.findOneAndUpdate(
      { _id: cc.event },
      { $pull: { rate: { id: test } } },
    );
    return { statusCode: HttpStatus.OK, rates: user.rates };
  }

  async uploadUnboredImage(
    userId: string,
    eventId: string,
    file: Express.Multer.File,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    const pictureForUser = {
      id: file.filename,
      eventId: eventId,
    };

    const pictureForEvent = {
      id: file.filename,
      userId: userId,
    };
    if (!Types.ObjectId.isValid(eventId))
      throw new NotFoundException('Invalid Id');
    try {
      await this.userModel.findOneAndUpdate(
        { _id: userId },
        { $addToSet: { pictures: pictureForUser } },
        { new: true },
      );
      await this.eventModel.findOneAndUpdate(
        { _id: eventId },
        { $addToSet: { pictures: pictureForEvent } },
        { new: true },
      );
      return { statusCode: HttpStatus.OK, message: 'Image uploaded !' };
    } catch (err) {
      throw new BadRequestException('Bad request');
    }
  }
}

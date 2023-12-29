import {
  Controller,
  UseGuards,
  Post,
  Req,
  Body,
  Get,
  Delete,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
  FileTypeValidator,
  ParseFilePipe,
  BadRequestException,
} from '@nestjs/common';
import fs from 'fs';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { AddEventDto } from './dto/AddEvent.dto';
import { createEventDto } from './dto/CreateEvent.dto';
import { editEventDto } from './dto/EditEvent.dto';
import { rateEventDto } from './dto/RateEvent.Dto';
import { DeleteEventDto } from './dto/RemoveEvent.dto';
import { EventService } from './event.service';
import { HttpStatus } from '@nestjs/common';
import { Events } from './schemas/events.schema';
import { removeEventRateDto } from './dto/DeleteEventRate.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  @UseGuards(JwtGuard)
  @Get('/')
  async showEvent(
    @Req() req,
  ): Promise<{ status: HttpStatus; reservations: string[] }> {
    return this.eventService.showEvent(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('/lists')
  async listAllEvent(): Promise<{
    status: HttpStatus;
    events: NonNullable<unknown>[];
  }> {
    return this.eventService.listAllEvent();
  }

  @UseGuards(JwtGuard)
  @Post('/add')
  async addEvent(
    @Req() req,
    @Body() addEventDto: AddEventDto,
  ): Promise<{ status: HttpStatus; reservations: string[] }> {
    return this.eventService.addEvent(req.user.id, addEventDto);
  }

  @UseGuards(JwtGuard)
  @Delete('/delete')
  async deleteEvent(
    @Req() req,
    @Body() deleteEventDto: DeleteEventDto,
  ): Promise<{ status: HttpStatus; reservations: string[] }> {
    return this.eventService.removeEvent(req.user.id, deleteEventDto);
  }

  @UseGuards(JwtGuard)
  @Get('/show')
  async showDetails(
    @Query('id') id,
  ): Promise<{ status: HttpStatus; event: Events }> {
    return this.eventService.getEventById(id);
  }

  @UseGuards(JwtGuard)
  @Post('/createevent')
  async addUnboredEvent(
    @Body() createEventDto: createEventDto,
  ): Promise<{ status: HttpStatus; event: Events }> {
    return this.eventService.createUnboredEvent(createEventDto);
  }

  @UseGuards(JwtGuard)
  @Delete('/deleteevent')
  async deleteUnboredEvent(
    @Query('id') id,
  ): Promise<{ status: HttpStatus; message: string }> {
    return this.eventService.deleteUnboredEvent(id);
  }

  @UseGuards(JwtGuard)
  @Put('/editevent')
  async editUnboredEvent(
    @Query('id') id,
    @Body() editEventDto: editEventDto,
  ): Promise<{ status: HttpStatus; event: Events }> {
    return this.eventService.editUnboredEvent(editEventDto, id);
  }

  @UseGuards(JwtGuard)
  @Post('/rateevent')
  async addUnboredEventRate(
    @Query('id') id,
    @Body() rateEventDto: rateEventDto,
    @Req() req,
  ): Promise<{ status: HttpStatus; event: Events }> {
    return this.eventService.addUnboredRateEvent(id, rateEventDto, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Delete('/removerate')
  async removeUnboredEventRate(
    @Req() req,
    @Body() removeEventRateDto: removeEventRateDto,
  ): Promise<{ status: HttpStatus; rates: NonNullable<unknown> }> {
    return this.eventService.deleteUnboredRate(req.user.id, removeEventRateDto);
  }

  @UseGuards(JwtGuard)
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file', { dest: './data/images' }))
  async uploadUnboredImages(
    @Req() req,
    @Query('id') id,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpg|jpeg)' })],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      console.log(file);
      return await this.eventService.uploadUnboredImage(req.user.id, id, file);
    } catch (err) {
      fs.unlinkSync(file.path);
      throw new BadRequestException('Bad request');
    }
  }
}

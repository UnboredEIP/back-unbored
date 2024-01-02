import {
  Controller,
  UseGuards,
  Post,
  Req,
  Res,
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
import { Param } from '@nestjs/common';
import { join } from 'path';
import { Response } from 'express';

@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  @UseGuards(JwtGuard)
  @Get('/')
  async showEvent(
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; reservations: string[] }> {
    res.status(HttpStatus.OK);
    return this.eventService.showEvent(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('/lists')
  async listAllEvent(
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; events: Object[] }> {
    res.status(HttpStatus.OK);
    return this.eventService.listAllEvent();
  }

  @UseGuards(JwtGuard)
  @Post('/add')
  async addEvent(
    @Req() req,
    @Body() addEventDto: AddEventDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; reservations: string[] }> {
    res.status(HttpStatus.OK);
    return this.eventService.addEvent(req.user.id, addEventDto);
  }

  @UseGuards(JwtGuard)
  @Delete('/delete')
  async deleteEvent(
    @Req() req,
    @Body() deleteEventDto: DeleteEventDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; reservations: string[] }> {
    res.status(HttpStatus.OK);
    return this.eventService.removeEvent(req.user.id, deleteEventDto);
  }

  @UseGuards(JwtGuard)
  @Get('/show')
  async showDetails(
    @Query('id') id,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    res.status(HttpStatus.OK);
    return this.eventService.getEventById(id);
  }

  @UseGuards(JwtGuard)
  @Post('/createevent')
  async addUnboredEvent(
    @Body() createEventDto: createEventDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    res.status(HttpStatus.CREATED);
    return this.eventService.createUnboredEvent(createEventDto);
  }

  @UseGuards(JwtGuard)
  @Delete('/deleteevent')
  async deleteUnboredEvent(
    @Query('id') id,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    res.status(HttpStatus.OK);
    return this.eventService.deleteUnboredEvent(id);
  }

  @UseGuards(JwtGuard)
  @Put('/editevent')
  async editUnboredEvent(
    @Query('id') id,
    @Body() editEventDto: editEventDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    res.status(HttpStatus.OK);
    return this.eventService.editUnboredEvent(editEventDto, id);
  }

  @UseGuards(JwtGuard)
  @Post('/rateevent')
  async addUnboredEventRate(
    @Query('id') id,
    @Body() rateEventDto: rateEventDto,
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    res.status(HttpStatus.OK);
    return this.eventService.addUnboredRateEvent(id, rateEventDto, req.user.id);
  }

  @UseGuards(JwtGuard)
  @Delete('/removerate')
  async removeUnboredEventRate(
    @Req() req,
    @Body() removeEventRateDto: removeEventRateDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; rates: Object }> {
    res.status(HttpStatus.OK);
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
    @Res({ passthrough: true }) res,
  ) {
    res.status(HttpStatus.OK);
    try {
      console.log(file);
      return await this.eventService.uploadUnboredImage(req.user.id, id, file);
    } catch (err) {
      const fs = require('fs');
      fs.unlinkSync(file.path);
      throw new BadRequestException('Bad request');
    }
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt-auth.guard';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/createEvent.dto';
import { Events } from './schemas/events.schema';
import { EditEventDto } from './dto/editEvent.dto';
import { ProGuard } from 'src/guards/role.guard';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @UseGuards(JwtGuard)
  @Get('/lists')
  @ApiTags('Global Events')
  @ApiSecurity('authorization')
  @ApiOperation({ summary: 'List all events' })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async listEvents(
    @Req() req,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; events: Object[] }> {
    const response = await this.eventsService.listAllEvent(req.user.id);
    res.status(response.statusCode);
    return response;
  }

  @UseGuards(JwtGuard)
  @Post('/create/private')
  @ApiTags('Global Events')
  @ApiSecurity('authorization')
  @ApiOperation({ summary: 'Create Event' })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async createPrivateEvent(
    @Req() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createEventDto: CreateEventDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    const response = await this.eventsService.createUnboredPrivateEvent(
      req.user.id,
      createEventDto,
    );
    res.status(response.statusCode);
    return response;
  }

  @UseGuards(JwtGuard, ProGuard)
  @Post('/create')
  @ApiTags('Global Events')
  @ApiSecurity('authorization')
  @ApiOperation({ summary: 'Create Event' })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async createEvent(
    @Req() req,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createEventDto: CreateEventDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    const response = await this.eventsService.createUnboredEvent(
      req.user.id,
      createEventDto,
    );
    res.status(response.statusCode);
    return response;
  }

  @UseGuards(JwtGuard)
  @Put('/edit')
  @ApiTags('Global Events')
  @ApiSecurity('authorization')
  @ApiOperation({ summary: 'Edit Event by Id (only for event creator)' })
  @ApiQuery({ name: 'id', required: true })
  @ApiConsumes('application/json')
  async editEvent(
    @Req() req,
    @Query('id') id,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    editEventDto: EditEventDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    const response = await this.eventsService.editUnboredEvent(
      req.user.id,
      editEventDto,
      id,
    );
    res.status(response.statusCode);
    return response;
  }

  @UseGuards(JwtGuard, ProGuard)
  @Delete('/delete')
  @ApiTags('Global Events')
  @ApiSecurity('authorization')
  @ApiOperation({ summary: 'Delete Event by Id (only for event creator)' })
  @ApiQuery({ name: 'id', required: true })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async deleteEvent(
    @Req() req,
    @Query('id') id,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    const response = await this.eventsService.deleteUnboredEvent(
      req.user.id,
      id,
    );
    res.status(response.statusCode);
    return response;
  }

  @UseGuards(JwtGuard)
  @Get('/show')
  @ApiTags('Global Events')
  @ApiSecurity('authorization')
  @ApiOperation({ summary: 'Show event by ID' })
  @ApiQuery({ name: 'id', required: true })
  @ApiConsumes('application/x-www-form-urlencoded', 'application/json')
  async showDetails(
    @Query('id') id,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; event: Events }> {
    const response = await this.eventsService.getEventById(id);
    res.status(response.statusCode);
    return response;
  }
}

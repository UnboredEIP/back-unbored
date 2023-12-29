import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../auth/schemas/user.schema';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { EventSchema } from './schemas/events.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema}]), MongooseModule.forFeature([{name: 'Events', schema: EventSchema}])],
  providers: [EventService, JwtStrategy],
  controllers: [EventController]
})

export class EventModule {}

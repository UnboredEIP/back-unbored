import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserSchema } from './schemas/user.schema';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
            useFactory: () => {
                return {
                    secret: "123456",
                    signOptions: {
                        expiresIn: "3d"
                    },
                };
            }
        }),
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}]),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, RefreshStrategy],
})

export class AuthModule {}
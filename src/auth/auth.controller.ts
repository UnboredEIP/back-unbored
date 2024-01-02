import {
  Controller,
  Get,
  Post,
  Query,
  Headers,
  Body,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtGuard } from './guards/jwt-auth.guard';
import { RefreshGuard } from './guards/refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Method for '/register' route
   * @param registerDto See the definition of the registerDto file to see the list of required propriety
   * @returns Return a promise with the HTTP status and a message
   */
  @Post('/register')
  register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    res.status(HttpStatus.CREATED);
    return this.authService.register(registerDto);
  }

  /**
   * Method for '/login' route
   * @param loginDto See the definition of the loginDto file to see the list of required propriety
   * @returns Return a promise with the HTTP status an AuthToken and a RefreshToken
   */
  @Post('/login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; token: string; refresh: string }> {
    res.status(HttpStatus.ACCEPTED);
    return this.authService.login(loginDto);
  }

  /**
   * Method for '/refresh' route
   * @param req req stores an user translated by JwtStrategy
   * @param head head has to store a refresh token
   * @returns Return a promise with the HTTP status and a new AuthToken and the RefreshToken
   */

  @UseGuards(RefreshGuard)
  @UseGuards(JwtGuard)
  @Post('/refresh')
  refresh(
    @Req() req,
    @Headers() head,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; token: string; refresh: string }> {
    res.status(HttpStatus.ACCEPTED);
    return this.authService.refresh(req.user, head.refresh);
  }

  @Post('/login/google')
  loginGoogle(
    @Body() body,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; token: string; refresh: string }> {
    res.status(HttpStatus.ACCEPTED);
    return this.authService.googleLogin(body?.googleTokenId);
  }

  @Post('/askreset')
  askResetPassword(
    @Body() Body,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    res.status(HttpStatus.ACCEPTED);
    return this.authService.askResetPassword(Body?.email);
  }

  @Post('/reset')
  resetPassword(
    @Body() Body,
    @Query('id') id,
    @Res({ passthrough: true }) res,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    res.status(HttpStatus.ACCEPTED);
    return this.authService.resetPassword(id, Body?.password);
  }
}

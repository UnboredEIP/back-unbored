import {
  ConflictException,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { HttpStatus } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { MailerService } from '@nestjs-modules/mailer';
// import { MailerService } from '@nestjs-modules/mailer';

const client = new OAuth2Client(process.env.GOOGLE_OAUTH2);

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  /**
   * Function used by the method "register" in AuthController to store new user to the database
   * @param registerDto See the definition of the registerDto file to see the list of required propriety
   * @returns Return a promise with the HTTP status and a message
   */
  async register(
    registerDto: RegisterDto,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    const {
      username,
      email,
      password,
      description,
      gender,
      number,
      birthdate,
      preferences,
    } = registerDto;
    const hash = await bcrypt.hash(password, 10);
    const existing = await this.userModel.find({
      $or: [{ email: email }, { username: username }, { number: number }],
    });
    if (existing.length >= 1) {
      throw new ConflictException('Duplicated key');
    }
    await this.userModel.create({
      username,
      email,
      gender,
      role: Role.USER,
      birthdate,
      number,
      password: hash,
      description,
      preferences: preferences,
      style: {
        head: '0',
        body: '0',
        pants: '0',
        shoes: '0',
      },
      unlockedStyle: {
        head: ['0'],
        body: ['0'],
        pants: ['0'],
        shoes: ['0'],
      },
    });
    return { statusCode: HttpStatus.CREATED, message: 'Succesfully created !' };
  }

  /**
   * Function used by the method "login" in AuthController to login an user
   * @param loginDto See the definition of the loginDto file to see the list of required propriety
   * @returns Return a promise with the HTTP status an AuthToken and a RefreshToken
   */

  async login(
    loginDto: LoginDto,
  ): Promise<{ statusCode: HttpStatus; token: string; refresh: string }> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const sign = await this.userModel
      .findOne({ email })
      .select('-password')
      .select('-__v')
      .select('-style')
      .select('-unlockedStyle')
      .select('-rates')
      .select('-pictures')
      .select('-groups')
      .select('-invitations')
      .select('-reservations');

    const token = this.jwtService.sign({ users: sign });
    const refreshToken = this.jwtService.sign(
      { users: sign },
      { expiresIn: '90d', secret: process.env.JWT_REFRESH },
    );
    return {
      statusCode: HttpStatus.ACCEPTED,
      token: token,
      refresh: refreshToken,
    };
  }

  /**
   * Function user by the method "refresh" in AuthController to refresh AuthToken
   * @param user User is the current user who want to refresh his token
   * @param head actualRefresh is the refreshToken of the user
   * @returns Return a promise with the HTTP status and a new AuthToken and the RefreshToken
   */
  async refresh(
    user: User,
    actualRefresh: string,
  ): Promise<{ statusCode: HttpStatus; token: string; refresh: string }> {
    const sign = await this.userModel
      .findById(user.id)
      .select('-password')
      .select('-__v')
      .select('-style')
      .select('-unlockedStyle')
      .select('-rates')
      .select('-pictures')
      .select('-groups')
      .select('-invitations')
      .select('-reservations');

    return {
      statusCode: HttpStatus.ACCEPTED,
      token: this.jwtService.sign({ users: sign }),
      refresh: actualRefresh,
    };
  }

  async googleLogin(
    tokenId: string,
  ): Promise<{ statusCode: HttpStatus; token: string; refresh: string }> {
    console.log(tokenId);
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: [
        '134575829737-ukmecg47kp10fpg20po5bo5h6k6r30uo.apps.googleusercontent.com',
      ],
    });
    console.log('verified');
    const email = ticket.getPayload()?.email ?? '';
    const username = ticket.getPayload()?.name ?? '';
    if (!email || !username) {
      throw new ConflictException('Email or username could not be verified');
    }
    let user = await this.userModel.findOne({ email: email });
    if (!user) {
      user = await this.userModel.create({
        email: email,
        password: email + process.env.GOOGLE_PWD_CONFIG,
        description: '',
        style: {
          head: '0',
          body: '0',
          pants: '0',
          shoes: '0',
        },
        role: Role.USER,
        unlockedStyle: {
          head: ['0'],
          body: ['0'],
          pants: ['0'],
          shoes: ['0'],
        },
      });
    }
    const token = this.jwtService.sign({ id: user._id, role: user.role });
    const refreshToken = this.jwtService.sign(
      { id: user._id, role: user.role },
      { expiresIn: '90d', secret: process.env.JWT_REFRESH },
    );
    return {
      statusCode: HttpStatus.ACCEPTED,
      token: token,
      refresh: refreshToken,
    };
  }

  async askResetPassword(
    email: string,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    const token = this.jwtService.sign(
      { email: email },
      { expiresIn: '5min', secret: process.env.RESET_PASSWORD_SECRET },
    );
    const userExists = this.userModel.findOne({ email: email });
    if (await !userExists) {
      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'If account exists mail will be sent',
      };
    }
    console.log(process.env.UNBORED_MAIL);
    console.log(process.env.UNBORED_PASSWORD);
    const emailContent = {
      to: email,
      subject: 'Mot de passe oublié',
      text: '',
      html: `
            <div>
                <a>Vous pouvez reinitialiser votre mot de passe en utilisant ce lien : <a href="http://${process.env.URLFRONT}/forgot-password?id=${token}"> Reinitialiser  </a></a>
            </div>`,
    };
    await this.mailerService.sendMail(emailContent);
    console.log(token);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'If account exists mail will be sent',
    };
  }

  async resetPassword(
    tokenId: string,
    password: string,
  ): Promise<{ statusCode: HttpStatus; message: string }> {
    try {
      const decodedToken = this.jwtService.verify(tokenId, {
        secret: process.env.RESET_PASSWORD_SECRET,
      });
      const hash = await bcrypt.hash(password, 10);
      await this.userModel.findOneAndUpdate(
        { email: decodedToken.email },
        { password: hash },
      );
    } catch (error) {
      throw new NotAcceptableException('Expired');
    }
    return { statusCode: HttpStatus.ACCEPTED, message: 'Password Changed' };
  }
}

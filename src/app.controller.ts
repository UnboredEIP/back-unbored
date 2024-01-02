import {
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
  Query,
  Res,
  UseGuards,
  StreamableFile,
  Next,
} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtGuard } from './auth/guards/jwt-auth.guard';
import { join } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @UseGuards(JwtGuard)
  @Get('/getImage')
  async serveImage(
    @Query('imageName') imageName: string,
    @Res() res: Response,
  ) {
    if (!imageName)
      throw new NotAcceptableException('Valid imageName is required');
    res.status(HttpStatus.OK);
    const imagePath = join(__dirname, '../', 'data', 'images', imageName);
    const fileExtension = path.extname(imagePath).toLowerCase();
    if (fileExtension) throw new NotAcceptableException('prout');
    try {
      await fs.promises.stat(imagePath);
      res.sendFile(imagePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException('Image not found');
      }
    }
  }
}

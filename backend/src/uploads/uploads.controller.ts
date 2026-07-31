import { Controller, Post, Get, UseGuards, UseInterceptors, UploadedFile, Body, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
@UseGuards(JwtAuthGuard) // any authenticated user can upload
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @Req() req,
  ) {
    return this.uploadsService.uploadFile(file, type, req.user.userId);
  }

  @Get('my-uploads')
  findMine(@Req() req) {
    return this.uploadsService.findMyUploads(req.user.userId);
  }
}
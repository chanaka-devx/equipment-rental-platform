import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { UploadsRepository } from './uploads.repository';
import * as dotenv from 'dotenv';
dotenv.config();

const ALLOWED_TYPES = ['ID_DOCUMENT', 'RENTAL_AGREEMENT', 'EQUIPMENT_IMAGE'];

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

@Injectable()
export class UploadsService {
  private s3 = new S3Client({
    region: 'auto',
    endpoint: getRequiredEnv('R2_ENDPOINT'),
    credentials: {
      accessKeyId: getRequiredEnv('R2_ACCESS_KEY_ID'),
      secretAccessKey: getRequiredEnv('R2_SECRET_ACCESS_KEY'),
    },
  });

  constructor(private readonly uploadsRepository: UploadsRepository) {}

  async uploadFile(file: Express.Multer.File, type: string, userId: string) {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_TYPES.includes(type)) {
      throw new BadRequestException(`type must be one of: ${ALLOWED_TYPES.join(', ')}`);
    }

    const key = `${type}/${userId}/${Date.now()}-${file.originalname}`;

    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const url = `${process.env.R2_PUBLIC_URL}/${key}`;

    return this.uploadsRepository.create(userId, type, url);
  }

  async findMyUploads(userId: string) {
    return this.uploadsRepository.findByUser(userId);
  }
}
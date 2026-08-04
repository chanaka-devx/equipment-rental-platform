import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const caCert = process.env.AIVEN_CA_CERT?.replace(/\\n/g, '\n');
    // Strip sslmode from URL — pg v8+ treats sslmode=require as verify-full
    // which overrides the ssl options object and rejects Aiven's cert.
    const connectionString = process.env.DATABASE_URL
      ?.replace(/[?&]sslmode=[^&]*/g, '')
      .replace(/\?$/, '');

    const pool = new Pool({
      connectionString,
      ssl: caCert
        ? { ca: caCert, rejectUnauthorized: true }
        : { rejectUnauthorized: false },
    });
    const adapter = new PrismaPg(pool);
    // @ts-ignore
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
import { Injectable } from '@nestjs/common';
import *as bcrypt from 'bcryptjs';
import { Client } from 'minio';
import { InjectMinio } from 'nestjs-minio';
@Injectable()
export class AuthHelper {

    constructor(
      @InjectMinio() private readonly minio:Client
    ) {}
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }


async presineduRL (imageKey:string){
  const buket =process.env.MINIO_BUCKET
  const presignedUrl = await this.minio.presignedGetObject(
   buket!,
   imageKey,
   60 * 60,
  )

  return presignedUrl;
}


}
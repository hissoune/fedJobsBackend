import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthHelper } from './helper';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthGuard } from 'src/guards/auth.guard';
import { NestMinioModule } from 'nestjs-minio';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.register({  
       secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
          signOptions: { expiresIn: '1h' },
    }),
       ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
     NestMinioModule.register({
           endPoint: process.env.MINIO_ENDPOINT || 'localhost',
           port:  9000,
           useSSL: false,
           accessKey: process.env.MINIO_ROOT_USER,
           secretKey: process.env.MINIO_ROOT_PASSWORD
           }),
    PrismaModule

  ],
  controllers: [AuthController],
  providers: [AuthService,AuthHelper,AuthGuard],
})
export class AuthModule {}

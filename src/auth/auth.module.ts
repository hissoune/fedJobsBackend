import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthHelper } from './helper';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthGuard } from 'src/guards/auth.guard';

@Module({
  imports: [
    JwtModule.register({  
       secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
          signOptions: { expiresIn: '1h' },
    }),
    PrismaModule

  ],
  controllers: [AuthController],
  providers: [AuthService,AuthHelper,AuthGuard],
})
export class AuthModule {}

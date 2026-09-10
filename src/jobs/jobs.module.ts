import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/guards/auth.guard';

@Module({
  imports:[
    PrismaModule,
    JwtModule.register({  
           secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
              signOptions: { expiresIn: '1h' },
        }),
  ],
  controllers: [JobsController],
  providers: [JobsService,AuthGuard],
})
export class JobsModule {}

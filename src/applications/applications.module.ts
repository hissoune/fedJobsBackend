import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthGuard } from 'src/guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    PrismaModule,
     JwtModule.register({  
          secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
            signOptions: { expiresIn: '1h' },
      }),
  ],

  controllers: [ApplicationsController],
  providers: [ApplicationsService,AuthGuard],
})
export class ApplicationsModule {}

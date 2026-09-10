import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';

@Module({
  imports: [
    
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
      JwtModule.register({  
           secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
              signOptions: { expiresIn: '1h' },
        }),
    
    
    AuthModule,
    
    
    JobsModule,
    
    
    ApplicationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

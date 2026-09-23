import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import {  RegisterDto } from './dto/create-auth.dto';
import { loginAuthDto } from './dto/login-auth.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import {Express}from 'express'
  import { UploadedFile } from '@nestjs/common';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


@Post('register')
@UseInterceptors(
  FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  }),
)
register(
  @Req() req,
  @Body() registerDto: RegisterDto,
  @UploadedFile() file: Express.Multer.File,
) {
  return this.authService.register(registerDto, file);
}
@UseGuards(AuthGuard)
@Patch('update')
@UseInterceptors(
  FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  }),
)
update(
  @Req() req,
  @Body() registerDto: any,
  @UploadedFile() file: Express.Multer.File,
) {
  const userId = req.user.id
  return this.authService.update(userId,registerDto, file);
}





  @Post('login')
  login(@Body() loginAuthDto: loginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  profile( @Req() request: any) {


  const userId = request.user?.id;
  
    return this.authService.profile(userId);
  }
  @UseGuards(AuthGuard)
  @Post('logout')
  logout( @Req() request: any) {


  const userId = request.user?.id;
  console.log("iddddddddddd",userId);
  
    return this.authService.logout(userId);
  }

    @Post('refresh')
    async refresh(@Body() refreshDto: any) {
      return this.authService.refresh(refreshDto);
    }


  

}

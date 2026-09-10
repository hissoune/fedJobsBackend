import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {  RegisterDto } from './dto/create-auth.dto';
import { loginAuthDto } from './dto/login-auth.dto';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
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

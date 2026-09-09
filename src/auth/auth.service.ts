import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { loginAuthDto } from './dto/login-auth.dto';
import { RegisterDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from './helper';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
  ) {}
  async register(registerDto: RegisterDto) {
      try {
        const hashedPassword = await this.authHelper.hashPassword(registerDto.password || '');
        const savedUser = await this.prismaService.user.create({
          data: {
            ...registerDto,
            password: hashedPassword
          } as any
        });

        const accessToken = this.jwtService.sign({ id: savedUser.id });
        const refreshToken = this.jwtService.sign({ id: savedUser.id }, { expiresIn: '7d' });
        const hashedToken = await this.authHelper.hashPassword(refreshToken);

        await this.prismaService.user.update({
          where: { id: savedUser.id },
          data: { refreshToken: hashedToken }
        });

        const { password, ...userWithoutPassword } = savedUser;
        return { ...userWithoutPassword, token: accessToken, refreshToken };
      } catch (error) {
        throw new BadRequestException('Registration failed');
      }
  }

  async login(loginAuthDto: loginAuthDto) {

    const user = await this.prismaService.user.findFirst({
      where: { email: loginAuthDto.email }
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await this.authHelper.comparePasswords(loginAuthDto.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({ id: user.id });
    const refreshToken = this.jwtService.sign({ id: user.id }, { expiresIn: '7d' });
    const hashedToken = await this.authHelper.hashPassword(refreshToken);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedToken }
    });

    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, token: accessToken, refreshToken };

  }

 async logout(userId: string) {
     const user =await  this.prismaService.user.findUnique({
      where:{id:userId}
     })

     console.log("useeeeeeeeee",user);
     

     if (!user) {
      throw new  NotFoundException("theere is no user ")
     }
    console.log('ffgfjgndfjkngfdgnfjkbgfjbjfbg');
    
   return   await  this.prismaService.user.update({
       where: { id: user.id },
      data: { refreshToken: null }
     })

    }

     async refresh(refreshDto:any) {
      const payload = await this.jwtService.verify(refreshDto.refreshToken);

      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
        select: {
          id: true,
          refreshToken: true
        }
      });

      if (!user) {
        throw new NotFoundException('user not found');
      }

      const match = await this.authHelper.comparePasswords(user.refreshToken || '', refreshDto.refreshToken);
      if (!match) {
        throw new NotFoundException('user not found');
      }

      console.log("u r heeeer  ");
      

      const accessToken = this.jwtService.sign({ id: user.id });
      const refreshToken = this.jwtService.sign({ id: user.id }, { expiresIn: '7d' });
      const hashedToken = await this.authHelper.hashPassword(refreshToken);

      await this.prismaService.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedToken }
      });

      const { refreshToken: _, ...userWithoutRefreshToken } = user;
      return { ...userWithoutRefreshToken, accessToken, refreshToken };
    }


  }



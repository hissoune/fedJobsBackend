import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { loginAuthDto } from './dto/login-auth.dto';
import { RegisterDto } from './dto/create-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthHelper } from './helper';
import { JwtService } from '@nestjs/jwt';
import { Client } from 'minio';
import { InjectMinio } from 'nestjs-minio';

@Injectable()
export class AuthService {
  constructor(
    private readonly authHelper: AuthHelper,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    @InjectMinio() private readonly minio: Client
  ) {}

  async register(
    registerDto: RegisterDto,
    file?: { originalname: string; buffer: Buffer; size: number; mimetype: string },
  ) {

      try {
        const hashedPassword = await this.authHelper.hashPassword(registerDto.password || '');
        const savedUser = await this.prismaService.user.create({
          data: {
            ...registerDto,
            password: hashedPassword
          } as any
        });
         let  imageKey:string = '' 
        if (file) {
           imageKey = `avatars/${savedUser.id}-${file.originalname}`
          await this.minio.putObject(
            process.env.MINIO_BUCKET || 'uploads',
            imageKey,
            file.buffer,
            file.size,
            { 'Content-Type': file.mimetype }
          );
        }

        const accessToken = this.jwtService.sign({ id: savedUser.id });
        const refreshToken = this.jwtService.sign({ id: savedUser.id }, { expiresIn: '7d' });
        const hashedToken = await this.authHelper.hashPassword(refreshToken);

        await this.prismaService.user.update({
          where: { id: savedUser.id },
          data: { refreshToken: hashedToken,imageUrl:imageKey }
        });
         
        const { password, ...userWithoutPassword } = savedUser;
       const  userWithUrl = {...userWithoutPassword,imageUrl:await this.authHelper.presineduRL(userWithoutPassword.imageUrl|| '')}
        return { userWithUrl, token: accessToken, refreshToken };
      } catch (error) {
        throw new BadRequestException('Registration failed');
      }
  }

  async update( 
    id: string,
    registerDto: any,
    file?: { originalname: string; buffer: Buffer; size: number; mimetype: string },
  ) {
  try {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: any = {
      name: registerDto.name,
      age: registerDto.age,
      email: registerDto.email,
    };

    if (registerDto.password) {
      data.password = await this.authHelper.hashPassword(
        registerDto.password,
      );
    }

    if (file) {
      const imageKey = `avatars/${user.id}/${crypto.randomUUID()}`;

      await this.minio.putObject(
        process.env.MINIO_BUCKET || 'uploads',
        imageKey,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      data.imageUrl = imageKey;
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id },
      data,
    });

    return updatedUser;
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }

    throw new BadRequestException('Update failed');
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

    const accessToken = this.jwtService.sign({ id: user.id,role:user.role });
    console.log("acs",accessToken);
    
    const refreshToken = this.jwtService.sign({ id: user.id }, { expiresIn: '7d' });
    const hashedToken = await this.authHelper.hashPassword(refreshToken);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedToken }
    });



    const { password, ...userWithoutPassword } = user;

   const  userWithUrl = {...userWithoutPassword,imageUrl:await this.authHelper.presineduRL(userWithoutPassword.imageUrl || '')}
    return { userWithUrl, token: accessToken, refreshToken };

  }
 
 async profile(userId:string){

   const user =await  this.prismaService.user.findUnique({
      where:{id:userId}
     })

   if (!user) {
     throw new NotFoundException('user not found');
   }

 const { refreshToken: _refreshToken, password: _password, ...userWithoutRefreshToken } = user;
 return {...userWithoutRefreshToken,imageUrl:await this.authHelper.presineduRL(userWithoutRefreshToken.imageUrl||'')}

 }

 async logout(userId: string) {
     const user =await  this.prismaService.user.findUnique({
      where:{id:userId}
     })     

     if (!user) {
      throw new  NotFoundException("theere is no user ")
     }    
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

      const match = await this.authHelper.comparePasswords( refreshDto.refreshToken,user.refreshToken || '');
      if (!match) {
        throw new NotFoundException('user not found');
      }

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



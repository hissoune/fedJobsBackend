import { IsEmail, IsNotEmpty, IsString } from "@nestjs/class-validator"

export class loginAuthDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email!: string 

   @IsNotEmpty()
    @IsString()
    password!: string
}

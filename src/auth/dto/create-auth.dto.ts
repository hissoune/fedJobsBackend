import { IsEmail, IsNotEmpty, IsString } from "@nestjs/class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;
}
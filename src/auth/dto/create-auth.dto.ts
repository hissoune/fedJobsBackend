import { IsEmail, IsNotEmpty, IsOptional, IsString } from "@nestjs/class-validator";
import { Express } from "express";

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
    age!: string;

    @IsNotEmpty()
    @IsString()
    password!: string;



}
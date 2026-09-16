import { IsString, IsUUID } from '@nestjs/class-validator';

export class CreateApplicationDto {
  @IsString()
  message!: string;

  @IsUUID()
  jobId!: string;

  @IsUUID()
  techId!: string;
}
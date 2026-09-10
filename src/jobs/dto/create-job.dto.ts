import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from '@nestjs/class-validator';
import { JobPriority } from 'src/generated/enums';



export class CreateJobDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(JobPriority)
  @IsOptional()
  priority?: JobPriority;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notes!: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

}
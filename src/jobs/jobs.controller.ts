import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/guards/roles.decorator';

@UseGuards(AuthGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(RolesGuard)
  @Roles('ADMIN','CUSTOMER')
  @Post()
  create(@Body() createJobDto: CreateJobDto,@Req() req:any) {
    const userId = req.user.id

    return this.jobsService.create(userId,createJobDto);
  }

  @Get()
  findAll(@Query('page') page:number,@Query('priority') priority?:string) {
    return this.jobsService.findAll(page,priority);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN','CUSTOMER')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto,@Req() req) {
      const customerId = req.user.id
    return this.jobsService.update(id,customerId, updateJobDto);
  }
  
  @UseGuards(RolesGuard)
  @Roles('ADMIN','CUSTOMER')
  @Delete(':id')
  remove(@Param('id') id: string,@Req() req:any) {
    const customerId = req.user.id
    
    return this.jobsService.remove(id,customerId);
  }

}

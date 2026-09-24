import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus } from 'src/generated/enums';
import { AuthGuard } from 'src/guards/auth.guard';
 @UseGuards(AuthGuard)

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }
  @Get()
  findAll(@Req() req:any) {
     const userId = req.user.id
    return this.applicationsService.findAll(userId);
  }
 
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req:any) {
     const userId = req.user.id
    return this.applicationsService.findOne(id);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() status: ApplicationStatus, @Req() req:any) {
     const userId = req.user.id
    return this.applicationsService.updateStatus(id, status);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req:any) {
     const userId = req.user.id
    return this.applicationsService.remove(id);
  }
}

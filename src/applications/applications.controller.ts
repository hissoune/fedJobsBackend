import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus } from 'src/generated/enums';
import { AuthGuard } from 'src/guards/auth.guard';
 @UseGuards(AuthGuard)

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() createApplicationDto: CreateApplicationDto,@Req() req) {
    const userId = req.user.id
    return this.applicationsService.create(createApplicationDto,userId);
  }
  @Get()
  findAll(@Req() req:any , @Query() status: any) {
     const userId = req.user.id

     console.log("status in controller", status);
    return this.applicationsService.findAll(userId, status.status );
  }
 
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req:any) {
     const userId = req.user.id
    return this.applicationsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() status: ApplicationStatus, @Req() req:any) {
     const userId = req.user.id
    return this.applicationsService.updateStatus(id, status);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any, @Req() req:any) {
     const userId = req.user.id
    return this.applicationsService.update(id,userId, body);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req:any) {
     const userId = req.user.id
    return this.applicationsService.remove(id);
  }
}

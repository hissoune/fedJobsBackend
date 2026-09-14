import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JobPriority, JobStatus } from 'src/generated/enums';

@Injectable()
export class JobsService {

  constructor(
    private readonly prismaService:PrismaService
  ){}
  async create(userId:string,createJobDto: CreateJobDto) {
    try {
       const newJob = await this.prismaService.jobs.create({
        data: {...createJobDto,customerId:userId} ,
      });
       return newJob;
    } catch (error) {
      throw new BadRequestException('job craetion failed')
    }
  }

async findAll(page: number,priority?:string) {
  const limit = 6;
    let where: { status: JobStatus;technicianId:string | null; priority?: JobPriority } = {
      status: JobStatus.PENDING,
      technicianId:null 
    };

    if (priority) {
      where = { ...where, priority: priority as JobPriority };
    }
  const [jobs, total] = await Promise.all([
    this.prismaService.jobs.findMany({
      where
      ,
      skip: (page - 1) * limit,
      take: limit,
    }),

    this.prismaService.jobs.count({
      where: {
        status: JobStatus.PENDING,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    jobs,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
    total
  };
}

  async findOne(id: string) {
   const job =await  this.prismaService.jobs.findUnique({
    where:{id}
   })

   if (!job) throw new NotFoundException('job not found')

    return job
  }

  async update(id: string,customerId, updateJobDto: UpdateJobDto) {
   try {
     const job = await this.findOne(id)

    if (job.customerId != customerId) throw new ForbiddenException('this job is not yours to delete');

    return await this.prismaService.jobs.update({where:{id:id},
      data:updateJobDto
    })
        
   } catch (error) {
    throw new BadRequestException('job update failed ')
   }
  }

  async remove(id: string,customerId:string) {
   try {
    const job = await this.findOne(id)

    if (job.customerId != customerId) throw new ForbiddenException('this job is not yours to delete');

    await  this.prismaService.jobs.delete({where:{id}})
   return id
   } catch (error) {
    
   }
  }


}

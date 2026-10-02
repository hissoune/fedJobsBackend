import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus } from 'src/generated/enums';

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(createApplicationDto: CreateApplicationDto,userId) {
    const { jobId, message } = createApplicationDto;

    // Does the job exist?
    const job = await this.prisma.jobs.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Has this technician already applied?
    const existingApplication =
      await this.prisma.applications.findFirst({
        where: {
          jobId,
          techId:userId,
        },
      });

    if (existingApplication) {
      throw new BadRequestException(
        'You already applied to this job',
      );
    }
   console.log("application will be created ");
   
    await this.prisma.applications.create({
      data: {
        jobId,
        techId:userId,
        message,
      },
    });

    return await this.prisma.jobs.findUnique({
      where: { id: jobId },
       include:{
        customer:true ,
        applications:true
        }
    });
  }

  async findAll(userId:string, status?: ApplicationStatus) {

      let where: {
        techId: string;
        status?: ApplicationStatus;
      } = {
          techId: userId,
        };
    
        if (status) {
          console.log("status is ",status);
         where= {...where, status:status };
        }

      
    return this.prisma.applications.findMany({
      where,
      include: {
        technician: true,
        job: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const application = await this.prisma.applications.findUnique({
      where: { id },
      include: {
        technician: true,
        job: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async update(id: string, userId:string, body: any) {

    console.log("userId in update", userId);
    console.log("message in update", body);
    const application = await this.prisma.applications.findUnique({
      where: { id },
    });

    if (!application ) {
      throw new NotFoundException('Application not found');
    }

    if (application.techId !== userId) {
      throw new BadRequestException(
        'You are not authorized to update this application',
      );
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        `You cannot update an application that has been ${application.status}`,
      );
    }
        await  this.prisma.applications.update({
          where: { id },
          data: body,
        });

    return await this.findOne(id);
  }


  async updateStatus(
    id: string,
    status: ApplicationStatus,
  ) {
    const application = await this.prisma.applications.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.applications.update({
      where: { id },
      data: {
        status,
      },
    });
  }

  async remove(id: string) {
    const application = await this.prisma.applications.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.applications.delete({
      where: { id },
    });
  }


  async approve(id: string) {
  const application = await this.prisma.applications.findUnique({
    where: { id },
  });

  if (!application) {
    throw new NotFoundException('Application not found');
  }

  if (application.status !== ApplicationStatus.PENDING) {
    throw new BadRequestException(
      'This application has already been processed',
    );
  }

  return this.prisma.$transaction(async (tx) => {
    const updatedApplication = await tx.applications.update({
      where: { id },
      data: {
        status: ApplicationStatus.APPROVED,
      },
    });

    await tx.jobs.update({
      where: { id: application.jobId },
      data: {
        technicianId: application.techId,
      },
    });

    return updatedApplication;
  });
}

async decline(id: string) {
  const application = await this.prisma.applications.findUnique({
    where: { id },
  });

  if (!application) {
    throw new NotFoundException('Application not found');
  }

  if (application.status !== ApplicationStatus.PENDING) {
    throw new BadRequestException(
      'This application has already been processed',
    );
  }

  return this.prisma.applications.update({
    where: { id },
    data: {
      status: ApplicationStatus.DECLINED,
    },
  });
}
}
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

  async create(createApplicationDto: CreateApplicationDto) {
    const { jobId, techId, message } = createApplicationDto;

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
          techId,
        },
      });

    if (existingApplication) {
      throw new BadRequestException(
        'You already applied to this job',
      );
    }

    return this.prisma.applications.create({
      data: {
        jobId,
        techId,
        message,
      },
    });
  }

  async findAll() {
    return this.prisma.applications.findMany({
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
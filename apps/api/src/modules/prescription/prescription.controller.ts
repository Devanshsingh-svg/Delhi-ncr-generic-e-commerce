import { Body, Controller, Post, Get, Param, BadRequestException, Inject } from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  CreatePrescriptionRequestSchema,
  VerifyPrescriptionRequestSchema,
  PrescriptionResponseSchema,
  PrescriptionValidationResponseSchema,
} from '@gq/contracts';
import { PrescriptionService, PrescriptionPersistencePort } from '@gq/domain';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('prescriptions')
export class PrescriptionController {
  private readonly service: PrescriptionService;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('PrescriptionRepository') private readonly repo: PrescriptionPersistencePort,
  ) {
    this.service = new PrescriptionService(repo);
  }

  @Post()
  async create(@Body(new ZodValidationPipe(CreatePrescriptionRequestSchema)) body: any) {
    try {
      const prescription = await this.service.create(body);
      return { success: true, data: PrescriptionResponseSchema.parse(prescription) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.code });
    }
  }

  @Get(':id/validate')
  async validate(@Param('id') id: string) {
    const result = await this.service.validateForDispense(id);
    return { success: true, data: PrescriptionValidationResponseSchema.parse({ prescriptionId: id, ...result }) };
  }

  @Post(':id/verify')
  async verify(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(VerifyPrescriptionRequestSchema)) body: any,
  ) {
    try {
      const prescription = await this.service.verify({ prescriptionId: id, ...body });
      return { success: true, data: PrescriptionResponseSchema.parse(prescription) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.code });
    }
  }
}

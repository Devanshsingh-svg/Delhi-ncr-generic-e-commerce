/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Post, Get, Param, BadRequestException, Inject } from '@nestjs/common';

import {
  CreateCytotoxicDrugRequestSchema,
  UpdateCytotoxicHandlingRequestSchema,
  CytotoxicDrugResponseSchema,
  CytotoxicHandlingValidationResponseSchema,
} from '@gq/contracts';
import { CytotoxicHandlingService , CytotoxicPersistencePort } from '@gq/domain';

import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
@Controller('cytotoxic')
export class CytotoxicController {
  private readonly service: CytotoxicHandlingService;

  constructor(
    @Inject('CytotoxicRepository') private readonly repo: CytotoxicPersistencePort,
  ) {
    this.service = new CytotoxicHandlingService(repo);
  }

  @Post()
  async create(@Body(new ZodValidationPipe(CreateCytotoxicDrugRequestSchema)) body: any) {
    try {
      const cytotoxic = await this.service.createCytotoxicDrug(body);
      return { success: true, data: CytotoxicDrugResponseSchema.parse(cytotoxic) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.code });
    }
  }

  @Get('formulation/:formulationId')
  async getByFormulation(@Param('formulationId') formulationId: string) {
    const cytotoxic = await this.service.findCytotoxicDrugByFormulationId(formulationId);
    if (!cytotoxic) {
      throw new BadRequestException({ message: 'Cytotoxic drug not found', code: 'CYTOTOXIC_DRUG_NOT_FOUND' });
    }
    return { success: true, data: CytotoxicDrugResponseSchema.parse(cytotoxic) };
  }

  @Post('validate')
  async validate(@Body(new ZodValidationPipe(CreateCytotoxicDrugRequestSchema)) body: any) {
    try {
      const result = this.service.validateHandling({
        formulationId: body.formulationId,
        handling: body.cytotoxicHandling,
      });
      return { success: true, data: CytotoxicHandlingValidationResponseSchema.parse(result) };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.code });
    }
  }

  @Post(':id/handling')
  async updateHandling(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateCytotoxicHandlingRequestSchema)) body: any,
  ) {
    try {
      await this.service.updateHandling(id, body.cytotoxicHandling);
      return { success: true, data: { id, updated: true } };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.code });
    }
  }

  @Get(':id/verify')
  async verify(@Param('id') id: string) {
    try {
      const result = await this.service.verifyHandlingRestrictions(id);
      return { success: true, data: result };
    } catch (e: any) {
      throw new BadRequestException({ message: e.message, code: e.code });
    }
  }
}

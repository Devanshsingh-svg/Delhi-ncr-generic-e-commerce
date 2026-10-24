import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { CatalogController } from './catalog.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CatalogController],
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class CatalogModule {}
import { Module } from '@nestjs/common';
import { ExercisesCatalogController } from './exercises-catalog.controller';

@Module({
  controllers: [ExercisesCatalogController],
})
export class ExercisesCatalogModule {}
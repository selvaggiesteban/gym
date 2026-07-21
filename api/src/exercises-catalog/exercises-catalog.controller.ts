import { Controller, Get, Query } from '@nestjs/common';
// El catalogo se sirve desde web/public/exercises/exercises.json (leido por el frontend).
// Este endpoint solo expone metadatos agregados (body parts, equipments) para filtros.
@Controller('exercises-catalog')
export class ExercisesCatalogController {
  @Get('facets')
  facets() {
    return {
      bodyParts: ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'],
      equipment: ['Barbell', 'Body Weight', 'Cable', 'Dumbbell', 'Kettlebell', 'Band', 'Leverage Machine', 'Smith Machine', 'Weighted', 'Stability Ball', 'EZ Barbell', 'Other'],
      languages: ['en', 'es', 'it', 'tr', 'ru', 'zh', 'hi', 'pl', 'ko', 'fr'],
    };
  }
}
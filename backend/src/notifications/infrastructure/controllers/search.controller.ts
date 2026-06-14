import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { SearchIndexService } from '../services/search-index.service';

@ApiTags('Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly indexService: SearchIndexService) {}

  /** Búsqueda O(log n + k) sobre el AVL en memoria. */
  @Get()
  @ApiOperation({ summary: 'Búsqueda rápida en índice AVL (tiendas + productos)' })
  search(@Query('q') q: string, @Query('limit') limit?: string) {
    const lim = limit ? Math.min(Number(limit), 100) : 20;
    return this.indexService.search(q ?? '', lim);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas del índice AVL' })
  stats() {
    return this.indexService.stats();
  }

  @Post('rebuild')
  @ApiOperation({ summary: 'Forzar reconstrucción del índice AVL' })
  rebuild() {
    return this.indexService.rebuild();
  }
}

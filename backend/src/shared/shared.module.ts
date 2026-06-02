import { Module, Global } from '@nestjs/common';
import { FastApiService } from './services/fastapi.service';

@Global()
@Module({
  providers: [FastApiService],
  exports: [FastApiService],
})
export class SharedModule {}
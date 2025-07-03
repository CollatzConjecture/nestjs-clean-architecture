import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggingInterceptor } from '@application/interceptors/logging.interceptor';
import { LoggerService } from '@application/services/logger.service';

@Controller({
  path: 'hello',
  version: '1'
})
@ApiTags('hello')
@UseInterceptors(LoggingInterceptor)
export class HelloController {
    constructor(private readonly logger: LoggerService) {}
    
    @Get('')
    @ApiOperation({ summary: 'Get hello message' })
    @ApiResponse({ status: 200, description: 'Returns hello world message' })
    get(): string {
        this.logger.logger('Hello World!', { module: 'HelloController', method: 'get' });
        return 'Hello World!';
    }
}
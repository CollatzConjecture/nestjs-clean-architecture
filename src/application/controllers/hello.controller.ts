import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Context, LoggerService } from '@domain/services/logger.service';
import { LoggingInterceptor } from '@application/interceptors/logging.interceptor';

@Controller('hello')
@ApiTags('hello')
@UseInterceptors(LoggingInterceptor)
export class HelloController {
    private Log: LoggerService = new LoggerService('HelloController');
    
    @Get('')
    @ApiOperation({ summary: 'Get hello message' })
    @ApiResponse({ status: 200, description: 'Returns hello world message' })
    get(): string {
        const context: Context = { module: 'HelloController', method: 'get' };
        this.Log.logger('Hello World!', context);
        return 'Hello World!';
    }
}
import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggingInterceptor } from '@application/interceptors/logging.interceptor';
import { LoggerService } from '@application/services/logger.service';
import { ResponseService } from '@application/services/response.service';
import { SuccessResponseDto } from '@api/dto/common/api-response.dto';

@Controller({
  path: 'hello',
  version: '1'
})
@ApiTags('hello')
@UseInterceptors(LoggingInterceptor)
export class HelloController {
  constructor(
    private readonly logger: LoggerService,
    private readonly responseService: ResponseService
  ) { }

  @Get('')
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Returns hello world message' })
  get(): SuccessResponseDto<string> {
    this.logger.logger('Hello World!', { module: 'HelloController', method: 'get' });
    return this.responseService.success('Hello World!', 'Hello World!');
  }
}
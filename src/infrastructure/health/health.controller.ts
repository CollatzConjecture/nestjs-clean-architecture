import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { TerminusOptionsService } from '@infrastructure/health/terminus-options.check';

@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly terminusOptionsService: TerminusOptionsService) {}

  @Get()
  check() {
    return this.terminusOptionsService.check();
  }
}

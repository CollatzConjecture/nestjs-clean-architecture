import { LoggerService } from '@application/services/logger.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have logger method', () => {
    expect(typeof service.logger).toBe('function');
    
    // Test that it doesn't throw
    expect(() => {
      service.logger('Test message', { module: 'TestModule', method: 'testMethod' });
    }).not.toThrow();
  });

  it('should have logger method without context', () => {
    expect(() => {
      service.logger('Test message without context');
    }).not.toThrow();
  });

  it('should have err method', () => {
    expect(typeof service.err).toBe('function');
    
    expect(() => {
      service.err('Error message', { module: 'ErrorModule', method: 'errorMethod' });
    }).not.toThrow();
  });

  it('should have warning method', () => {
    expect(typeof service.warning).toBe('function');
    
    expect(() => {
      service.warning('Warning message', { module: 'WarnModule', method: 'warnMethod' });
    }).not.toThrow();
  });
});
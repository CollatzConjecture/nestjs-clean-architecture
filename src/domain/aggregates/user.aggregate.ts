import { AggregateRoot } from '@nestjs/cqrs';

export class UserAggregate extends AggregateRoot {
  constructor() {
    super();
  }
} 
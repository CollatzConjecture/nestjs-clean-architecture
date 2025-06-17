import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Profile {
  @ApiProperty({
    description: 'The unique identifier of the profile',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  readonly id: string;

  @ApiProperty({
    description: 'The name of the profile',
    example: 'John Doe'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The lastname of the profile',
    example: 'Smith'
  })
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({
    description: 'The age of the profile',
    example: 25
  })
  @IsNumber()
  @IsNotEmpty()
  age: number;

}

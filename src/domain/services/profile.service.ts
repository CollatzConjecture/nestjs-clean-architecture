import { Injectable } from '@nestjs/common';
import { Profile } from '@domain/entities/Profile';
import { CreateProfileDto } from '@application/dto/create-profile.dto';
import { ProfileRepository } from '@infrastructure/repository/profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly repository: ProfileRepository) {}

  getHello(): string {
    return 'Hello World!';
  }

  async create(createProfileDto: CreateProfileDto): Promise<Profile> {
    return await this.repository.create(createProfileDto);
  }

  async find(): Promise<Profile[]> {
    return await this.repository.find();
  }

  async findById(id: string): Promise<Profile> {
    return await this.repository.findById(id);
  }
}

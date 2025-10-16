export class Profile {
  readonly id: string;
  readonly authId: string;
  name: string;
  lastname?: string;
  age?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

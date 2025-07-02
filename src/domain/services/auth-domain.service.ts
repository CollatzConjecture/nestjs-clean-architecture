import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { AuthUser } from '@domain/entities/Auth';
import { Role } from '@domain/entities/enums/role.enum';
import { IAuthRepository } from '@domain/interfaces/repositories/auth-repository.interface';

/**
 * Domain Service for Auth Business Logic
 * Contains pure business rules and logic
 */
@Injectable()
export class AuthDomainService {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepo: IAuthRepository
  ) {}

  /**
   * Business Logic: Validate user login credentials
   */
  async validateUserLogin(email: string, plainPassword: string): Promise<AuthUser | null> {
    if (!email || !plainPassword) {
      return null;
    }

    // Get user through domain interface (no infrastructure dependency)
    const user = await this.authRepo.findByEmail(email, true);
    
    if (!user) {
      return null;
    }

    // Note: Password comparison would be done by infrastructure/application layer
    // Domain just validates business rules
    return user;
  }

  /**
   * Business Logic: Create user from external provider
   */
  async createExternalUser(externalData: {
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    provider: 'google' | undefined;
  }): Promise<AuthUser> {
    
    const existingUser = await this.authRepo.findByEmail(externalData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const newUser: AuthUser = {
      id: this.generateUserId(),
      email: externalData.email,
      password: '',
      role: [Role.USER],
      googleId: externalData.provider === 'google' ? externalData.providerId : undefined
    };

    return await this.authRepo.create(newUser);
  }

  /**
   * Business Logic: Check if user can perform admin actions
   */
  canPerformAdminActions(user: AuthUser): boolean {
    return user.role.includes(Role.ADMIN);
  }

  /**
   * Business Logic: Validate if user can be created
   */
  async canCreateUser(email: string): Promise<boolean> {
    const existingUser = await this.authRepo.findByEmail(email);
    return !existingUser;
  }

  /**
   * Business Logic: Validate if user can be deleted
   */
  canDeleteUser(user: AuthUser, requestingUserId: string, isAdmin: boolean): boolean {
    return user.id === requestingUserId || isAdmin;
  }

  /**
   * Business Logic: Check if user exists for deletion (used in compensation actions)
   */
  async userExistsForDeletion(authId: string): Promise<boolean> {
    const user = await this.authRepo.findById(authId);
    return !!user;
  }

  /**
   * Business Logic: Check if user has required role
   */
  hasRole(user: AuthUser, requiredRole: Role): boolean {
    return user.role.includes(requiredRole);
  }

  /**
   * Business Logic: Validate password strength
   */
  isPasswordValid(password: string): boolean {
    // Business rule: Password must be at least 8 characters, contain uppercase, lowercase, and number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Business Logic: Validate email format
   */
  isEmailValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }



  /**
   * Business Logic: Validate user creation data
   */
  validateUserCreation(userData: { email: string; password: string }): void {
    if (!this.isEmailValid(userData.email)) {
      throw new Error('Invalid email format');
    }
    
    if (!this.isPasswordValid(userData.password)) {
      throw new Error('Password does not meet requirements');
    }
  }

  /**
   * Business Logic: Generate user ID
   */
  generateUserId(): string {
    return 'auth-' + uuidv4();
  }
} 
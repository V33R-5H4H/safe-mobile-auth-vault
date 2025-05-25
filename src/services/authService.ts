
import * as bcrypt from 'bcryptjs';
import { databaseService } from './databaseService';

interface AuthResult {
  success: boolean;
  message: string;
  user?: any;
}

class AuthService {
  async signUp(name: string, email: string, password: string): Promise<AuthResult> {
    try {
      console.log('AuthService: Starting signup process for:', email);
      
      // Check if user already exists
      const existingUser = await databaseService.getUserByEmail(email);
      if (existingUser) {
        console.log('AuthService: User already exists:', email);
        return {
          success: false,
          message: 'An account with this email already exists'
        };
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      console.log('AuthService: Password hashed successfully');

      // Create user
      const userId = await databaseService.createUser(name, email, hashedPassword);
      console.log('AuthService: User created with ID:', userId);

      return {
        success: true,
        message: 'Account created successfully',
        user: { id: userId, name, email }
      };
    } catch (error) {
      console.error('AuthService: Signup error:', error);
      return {
        success: false,
        message: 'Failed to create account. Please try again.'
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      console.log('AuthService: Starting login process for:', email);
      
      // Get user from database
      const user = await databaseService.getUserByEmail(email);
      if (!user) {
        console.log('AuthService: User not found:', email);
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.log('AuthService: Invalid password for:', email);
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      console.log('AuthService: Login successful for:', email);
      return {
        success: true,
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email }
      };
    } catch (error) {
      console.error('AuthService: Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }
}

export const authService = new AuthService();

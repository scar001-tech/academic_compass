import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '@shared/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  schoolId: string;
  iat?: number;
  exp?: number;
}

export class AuthService {
  /**
   * Generate JWT token with role information
   */
  static generateToken(payload: {
    id: string;
    email: string;
    role: UserRole;
    schoolId: string;
  }): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Hash password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hash
   */
  static async comparePassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: {
    id: string;
    role: UserRole;
    schoolId: string;
  }): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: '7d',
    });
  }

  /**
   * Decode token without verification (for initial parsing)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Extract role from token
   */
  static getRoleFromToken(token: string): UserRole | null {
    const decoded = this.decodeToken(token);
    return decoded?.role || null;
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  }
}

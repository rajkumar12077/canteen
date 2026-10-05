import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../storage';
import { config } from '../config';
import { User, UserRole } from '@smart-canteen/shared';

export class AuthService {
  public static async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
    canteenId?: string;
    department?: string;
  }) {
    const existing = db.findOne<User>('users', u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password, salt);

    const user: User = {
      _id: uuidv4(),
      organizationId: 'ORG-APEX-01',
      canteenIds: data.canteenId ? [data.canteenId] : ['CANTEEN-01'],
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone || '+91 98765 43210',
      passwordHash,
      role: data.role || UserRole.CUSTOMER,
      status: 'ACTIVE',
      mealAllowanceBalance: 2500,
      department: data.department || 'Engineering',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.insert('users', user);

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });

    const { passwordHash: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, token };
  }

  public static async login(email: string, password?: string) {
    const user = db.findOne<User>('users', u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // In demo environment, allow login if password matches or if demo password 'demo123'
    if (password && user.passwordHash) {
      const match = bcrypt.compareSync(password, user.passwordHash) || password === 'demo123';
      if (!match) {
        throw new Error('Invalid credentials');
      }
    }

    user.lastLogin = new Date().toISOString();
    db.update('users', user._id, { lastLogin: user.lastLogin });

    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });

    const { passwordHash: _, ...userWithoutPass } = user;
    return { user: userWithoutPass, token };
  }

  public static switchRole(targetRole: UserRole | string) {
    const demoUser = db.findOne<User>('users', u => u.role === targetRole);
    if (!demoUser) {
      throw new Error(`No demo user found for role ${targetRole}`);
    }

    const token = jwt.sign({ id: demoUser._id, role: demoUser.role, email: demoUser.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any
    });

    const { passwordHash: _, ...userWithoutPass } = demoUser;
    return { user: userWithoutPass, token };
  }
}

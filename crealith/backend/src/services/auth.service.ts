import { prisma } from '../app';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateToken } from '../utils/jwt';
import { createError } from '../utils/errors';

export class AuthService {
  async register(data: { email: string; password: string; firstName: string; lastName: string; role?: 'BUYER' | 'SELLER' }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw createError.conflict('User already exists');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: { ...data, passwordHash, role: data.role || 'BUYER' },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true }
    });

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    return { user, token };
  }

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({ where: { email: data.email, isActive: true } });
    if (!user || !await comparePassword(data.password, user.passwordHash)) {
      throw createError.unauthorized('Invalid credentials');
    }

    const token = generateToken({ userId: user.id, email: user.email, role: user.role });
    const { passwordHash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
}

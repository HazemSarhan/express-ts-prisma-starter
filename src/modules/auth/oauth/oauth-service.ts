import prisma from '../../../configs/prisma';
import { User as SafeUser } from '../../../types';

export const authenticateOAuthUser = async (data: {
  provider: 'GOOGLE' | 'GITHUB';
  providerId: string;
  email: string;
  name: string;
  image?: string | null;
}): Promise<SafeUser> => {
  const { provider, providerId, email, name, image } = data;

  const normalizedEmail = email.toLowerCase();
  let user = await prisma.user.findFirst({
    where: {
      provider,
      providerId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      provider: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (user) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        image: image || user.image,
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        provider: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        provider,
        providerId,
        image: image || existingUser.image,
        emailVerified: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        provider: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  const userCount = await prisma.user.count();
  const isFirstUser = userCount === 0;
  user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      image,
      provider,
      providerId,
      role: isFirstUser ? 'ADMIN' : 'USER',
      emailVerified: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      provider: true,
      role: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return user;
};

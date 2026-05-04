import prisma from '../config/prisma';

export const getAllUsersWithSessions = async (): Promise<any[]> => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      sessions: {
        where: {
          expiresAt: { gt: new Date() },
        },
        select: {
          updatedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return users.map((user) => ({
    ...user,
    activeSessionCount: user.sessions.length,
    lastActivity:
      user.sessions.length > 0
        ? new Date(Math.max(...user.sessions.map((s) => s.updatedAt.getTime())))
        : null,
  }));
};

export const revokeUserSessions = async (userId: string): Promise<any> => {
  return prisma.session.deleteMany({
    where: { userId },
  });
};

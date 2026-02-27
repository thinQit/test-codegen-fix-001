import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const user1 = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      passwordHash,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jamie Lee',
      email: 'jamie@example.com',
      passwordHash,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Finish project outline',
        description: 'Draft the outline for the upcoming project review.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        tags: ['work', 'planning'],
        ownerId: user1.id,
      },
      {
        title: 'Buy groceries',
        description: 'Milk, eggs, and vegetables.',
        status: 'in-progress',
        priority: 'medium',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
        tags: ['personal'],
        ownerId: user1.id,
      },
      {
        title: 'Schedule dentist appointment',
        description: 'Call the dental office and confirm appointment time.',
        status: 'done',
        priority: 'low',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        tags: ['health'],
        ownerId: user2.id,
      },
      {
        title: 'Prepare dashboard mockups',
        description: 'Create initial layout for dashboard widgets.',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        tags: ['design', 'work'],
        ownerId: user2.id,
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

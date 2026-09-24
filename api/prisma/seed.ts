import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/auth/password.utils';

const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');
const prisma = new PrismaClient({ datasourceUrl: `file:${dbPath}` });

async function main() {
  console.log('Seeding database...');

  // Admin user
  const adminHash = await hashPassword('admin1234');
  const adminProfile = await prisma.profile.upsert({
    where: { email: 'admin@gym.com' },
    update: {},
    create: {
      email: 'admin@gym.com',
      passwordHash: adminHash,
      name: 'Administrador',
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`Admin user: ${adminProfile.email} (${adminProfile.id})`);

  // Trainer user
  const trainerHash = await hashPassword('trainer1234');
  const trainerProfile = await prisma.profile.upsert({
    where: { email: 'trainer@gym.com' },
    update: {},
    create: {
      email: 'trainer@gym.com',
      passwordHash: trainerHash,
      name: 'Entrenador',
      role: 'TRAINER',
      isActive: true,
      trainer: {
        create: { specialty: 'General' },
      },
    },
    include: { trainer: true },
  });
  console.log(`Trainer user: ${trainerProfile.email} (${trainerProfile.trainer?.id})`);

  // Member user
  const memberHash = await hashPassword('member1234');
  const memberProfile = await prisma.profile.upsert({
    where: { email: 'member@gym.com' },
    update: {},
    create: {
      email: 'member@gym.com',
      passwordHash: memberHash,
      name: 'Miembro Test',
      role: 'MEMBER',
      whatsapp: '11-1234-5678',
      birthDate: new Date('1990-01-15'),
      isActive: true,
      member: {
        create: { memberCode: '0001', status: 'paid', expiryDate: new Date('2026-12-31') },
      },
    },
    include: { member: true },
  });
  console.log(`Member user: ${memberProfile.email} (${memberProfile.member?.id})`);

  // Sample schedule classes
  const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
  const classes = [
    { className: 'Crossfit', startTime: '09:00', instructor: 'Trainer', maxCapacity: 15 },
    { className: 'Spinning', startTime: '11:00', instructor: 'Trainer', maxCapacity: 20 },
    { className: 'Yoga', startTime: '18:00', instructor: 'Trainer', maxCapacity: 12 },
    { className: 'Peso Libre', startTime: '10:00', instructor: 'Trainer', maxCapacity: 25 },
  ];

  for (const day of days) {
    for (const cls of classes) {
      await prisma.scheduleClass.upsert({
        where: { id: `${day}-${cls.className}-${cls.startTime}` },
        update: {},
        create: {
          id: `${day}-${cls.className}-${cls.startTime}`,
          className: cls.className,
          dayOfWeek: day,
          startTime: cls.startTime,
          instructor: cls.instructor,
          maxCapacity: cls.maxCapacity,
        },
      });
    }
  }
  console.log(`Schedule: ${days.length * classes.length} classes created`);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt-ts';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const password = await hash(adminPassword, 10);

  // Create admin user
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: password,
      role: "ADMIN",
      emailVerified: new Date() //create date bypass verification
    },
  });

  // Create platforms
  const platforms = [
    { name: 'TikTok' },
    { name: 'Instagram' },
    { name: 'YouTube' },
    { name: 'Facebook' },
    { name: 'Twitter' }
  ];

  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { name: platform.name },
      update: {},
      create: platform
    });
  }

  // Create categories
  const categories = [
    { name: 'Lifestyle', description: 'Konten tentang gaya hidup, fashion, dan keseharian' },
    { name: 'Gaming', description: 'Konten gaming, review game, dan streaming' },
    { name: 'Tech', description: 'Teknologi, gadget, dan inovasi terbaru' },
    { name: 'Beauty', description: 'Kecantikan, makeup, dan perawatan' },
    { name: 'Food', description: 'Kuliner, masakan, dan review makanan' },
    { name: 'Travel', description: 'Wisata, petualangan, dan eksplorasi tempat' },
    { name: 'Education', description: 'Edukasi, pembelajaran, dan tips belajar' },
    { name: 'Health', description: 'Kesehatan, fitness, dan wellness' },
    { name: 'Business', description: 'Bisnis, entrepreneurship, dan investasi' },
    { name: 'Entertainment', description: 'Hiburan, musik, dan comedy' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log("✅ Seed completed:");
  console.log("  - Admin user: admin@example.com / admin123");
  console.log("  - Platforms: TikTok, Instagram, YouTube, Facebook, Twitter");
  console.log("  - Categories: 10 default categories created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
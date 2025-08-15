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

  // Create services for all platforms
  const allPlatforms = await prisma.platform.findMany();
  
  for (const platform of allPlatforms) {
    let services: Array<{name: string, description: string, type: string}> = [];
    
    switch (platform.name) {
      case 'TikTok':
        services = [
          { name: 'Post Video', description: 'Video post promosi produk atau layanan', type: 'video' },
          { name: 'Story', description: 'Story promosi 24 jam', type: 'story' },
          { name: 'Live Streaming', description: 'Live streaming dengan mention produk', type: 'live' },
          { name: 'Brand Integration', description: 'Integrasi brand dalam konten kreatif', type: 'integration' },
          { name: 'Challenge Creation', description: 'Membuat challenge branded', type: 'challenge' }
        ];
        break;
      case 'Instagram':
        services = [
          { name: 'Feed Post', description: 'Post foto/video di feed dengan caption promosi', type: 'post' },
          { name: 'Story', description: 'Story promosi 24 jam', type: 'story' },
          { name: 'Reels', description: 'Video pendek kreatif dengan produk', type: 'reels' },
          { name: 'IGTV', description: 'Video panjang di IGTV', type: 'igtv' },
          { name: 'Live Streaming', description: 'Live streaming dengan mention produk', type: 'live' }
        ];
        break;
      case 'YouTube':
        services = [
          { name: 'Dedicated Video', description: 'Video khusus review/unboxing produk', type: 'video' },
          { name: 'Product Integration', description: 'Integrasi produk dalam video reguler', type: 'integration' },
          { name: 'Shorts', description: 'YouTube Shorts promosi produk', type: 'shorts' },
          { name: 'Live Streaming', description: 'Live streaming dengan mention produk', type: 'live' },
          { name: 'Community Post', description: 'Post di tab community dengan produk', type: 'community' }
        ];
        break;
      case 'Facebook':
        services = [
          { name: 'Post', description: 'Post promosi di timeline Facebook', type: 'post' },
          { name: 'Story', description: 'Facebook Story promosi 24 jam', type: 'story' },
          { name: 'Video', description: 'Video promosi di Facebook', type: 'video' },
          { name: 'Live Streaming', description: 'Facebook Live dengan mention produk', type: 'live' },
          { name: 'Event Promotion', description: 'Promosi event atau acara brand', type: 'event' }
        ];
        break;
      case 'Twitter':
        services = [
          { name: 'Tweet', description: 'Tweet promosi produk atau layanan', type: 'tweet' },
          { name: 'Thread', description: 'Twitter thread review produk', type: 'thread' },
          { name: 'Spaces', description: 'Twitter Spaces dengan mention produk', type: 'spaces' },
          { name: 'Retweet Campaign', description: 'Campaign retweet dengan mention', type: 'retweet' },
          { name: 'Hashtag Campaign', description: 'Campaign dengan hashtag khusus', type: 'hashtag' }
        ];
        break;
    }

    for (const service of services) {
      await prisma.service.upsert({
        where: { 
          platformId_name: { 
            platformId: platform.id, 
            name: service.name 
          } 
        },
        update: {},
        create: {
          ...service,
          platformId: platform.id,
          isActive: true
        }
      });
    }
  }

  // Create payment methods
  const bankTransfer = await prisma.paymentMethod.upsert({
    where: { code: 'BANK_TRANSFER' },
    update: {},
    create: {
      name: 'Bank Transfer',
      code: 'BANK_TRANSFER',
      description: 'Transfer funds directly to bank account',
      isActive: true,
    },
  });

  const eWallet = await prisma.paymentMethod.upsert({
    where: { code: 'E_WALLET' },
    update: {},
    create: {
      name: 'E-Wallet',
      code: 'E_WALLET',
      description: 'Pay using digital wallet services',
      isActive: true,
    },
  });

  const creditCard = await prisma.paymentMethod.upsert({
    where: { code: 'CREDIT_CARD' },
    update: {},
    create: {
      name: 'Credit Card',
      code: 'CREDIT_CARD',
      description: 'Pay using credit card',
      isActive: true,
    },
  });

  // Create banks for Bank Transfer
  const bankData = [
    { name: 'Bank Central Asia (BCA)', accountNumber: '1234567890', accountName: 'PT Influence Media' },
    { name: 'Bank Mandiri', accountNumber: '0987654321', accountName: 'PT Influence Media' },
    { name: 'Bank Negara Indonesia (BNI)', accountNumber: '1122334455', accountName: 'PT Influence Media' },
    { name: 'Bank Rakyat Indonesia (BRI)', accountNumber: '5544332211', accountName: 'PT Influence Media' },
    { name: 'Bank Permata', accountNumber: '6677889900', accountName: 'PT Influence Media' },
  ];

  for (const bank of bankData) {
    await prisma.bank.upsert({
      where: { 
        paymentMethodId_name: {
          paymentMethodId: bankTransfer.id,
          name: bank.name
        }
      },
      update: {},
      create: {
        ...bank,
        paymentMethodId: bankTransfer.id,
        isActive: true,
      },
    });
  }

  // Create e-wallet options
  const eWalletData = [
    { name: 'GoPay', accountNumber: 'gopay@influencemedia.id', accountName: 'Influence Media' },
    { name: 'OVO', accountNumber: 'ovo@influencemedia.id', accountName: 'Influence Media' },
    { name: 'DANA', accountNumber: 'dana@influencemedia.id', accountName: 'Influence Media' },
    { name: 'ShopeePay', accountNumber: 'shopeepay@influencemedia.id', accountName: 'Influence Media' },
  ];

  for (const wallet of eWalletData) {
    await prisma.bank.upsert({
      where: { 
        paymentMethodId_name: {
          paymentMethodId: eWallet.id,
          name: wallet.name
        }
      },
      update: {},
      create: {
        ...wallet,
        paymentMethodId: eWallet.id,
        isActive: true,
      },
    });
  }

  console.log('✅ Payment methods seeded successfully');
}


  console.log("✅ Seed completed:");
  console.log("  - Admin user: admin@example.com / admin123");
  console.log("  - Platforms: TikTok, Instagram, YouTube, Facebook, Twitter");
  console.log("  - Categories: 10 default categories created");
  console.log("  - Services: Created for all platforms (TikTok, Instagram, YouTube, Facebook, Twitter)");
  console.log("  - Bank: Create to payment");


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
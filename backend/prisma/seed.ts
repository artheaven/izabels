import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем посев данных...');

  // Создаем админ-пользователя
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@izabels.com',
      passwordHash: hashedPassword,
      role: 'admin',
    },
  });
  console.log('✅ Админ создан:', admin.username);

  // Создаем главные категории
  const flowersCat = await prisma.category.upsert({
    where: { slug: 'cvetya-srez' },
    update: {},
    create: {
      name: 'Цветя-рез',
      slug: 'cvetya-srez',
      type: 'FLOWERS',
      description: 'Срезани цветя на парче',
      isEditable: false,
    },
  });

  const packagingCat = await prisma.category.upsert({
    where: { slug: 'opakovka' },
    update: {},
    create: {
      name: 'Опаковъчни материали',
      slug: 'opakovka',
      type: 'PACKAGING',
      description: 'Материали за опаковане на букети',
      isEditable: false,
    },
  });

  const bouquetsCat = await prisma.category.upsert({
    where: { slug: 'buketi' },
    update: {},
    create: {
      name: 'Букети',
      slug: 'buketi',
      type: 'BOUQUETS',
      description: 'Готови букети',
      isEditable: false,
    },
  });

  console.log('✅ Главные категории созданы');

  // Создаем подкатегории для цветов
  const flowersSubcat = await prisma.category.upsert({
    where: { slug: 'cvetya' },
    update: {},
    create: {
      name: 'Цветя',
      slug: 'cvetya',
      type: 'FLOWERS',
      parentId: flowersCat.id,
      isEditable: true,
    },
  });

  const greenerySubcat = await prisma.category.upsert({
    where: { slug: 'zelenina' },
    update: {},
    create: {
      name: 'Техническа зеленина',
      slug: 'zelenina',
      type: 'FLOWERS',
      parentId: flowersCat.id,
      isEditable: true,
    },
  });

  // Подкатегории упаковки
  const paperSubcat = await prisma.category.upsert({
    where: { slug: 'hartiya' },
    update: {},
    create: {
      name: 'Хартия',
      slug: 'hartiya',
      type: 'PACKAGING',
      parentId: packagingCat.id,
      isEditable: true,
    },
  });

  const ribbonSubcat = await prisma.category.upsert({
    where: { slug: 'lenta' },
    update: {},
    create: {
      name: 'Лента',
      slug: 'lenta',
      type: 'PACKAGING',
      parentId: packagingCat.id,
      isEditable: true,
    },
  });

  const filmSubcat = await prisma.category.upsert({
    where: { slug: 'folio' },
    update: {},
    create: {
      name: 'Фолио',
      slug: 'folio',
      type: 'PACKAGING',
      parentId: packagingCat.id,
      isEditable: true,
    },
  });

  console.log('✅ Подкатегории созданы');

  // Создаем цвета для упаковки
  const redColor = await prisma.packagingColor.upsert({
    where: { name: 'червен' },
    update: {},
    create: {
      name: 'червен',
      hexCode: '#FF0000',
      order: 1,
    },
  });

  const whiteColor = await prisma.packagingColor.upsert({
    where: { name: 'бял' },
    update: {},
    create: {
      name: 'бял',
      hexCode: '#FFFFFF',
      order: 2,
    },
  });

  const pinkColor = await prisma.packagingColor.upsert({
    where: { name: 'розов' },
    update: {},
    create: {
      name: 'розов',
      hexCode: '#FFC0CB',
      order: 3,
    },
  });

  console.log('✅ Цвета упаковки созданы');

  // Создаем тестовые цветы
  const redRose = await prisma.flower.upsert({
    where: { sku: 'FL-0001' },
    update: {},
    create: {
      sku: 'FL-0001',
      categoryId: flowersSubcat.id,
      priceCost: 1.5,
      markup: 2.0,
      price: 3.0, // 1.5 * 2.0
      images: [],
      translations: {
        create: {
          lang: 'bg',
          name: 'Червена роза',
          description: 'Класическа червена роза, височина 70см',
        },
      },
    },
  });

  const whiteRose = await prisma.flower.upsert({
    where: { sku: 'FL-0002' },
    update: {},
    create: {
      sku: 'FL-0002',
      categoryId: flowersSubcat.id,
      priceCost: 1.5,
      markup: 2.0,
      price: 3.0,
      images: [],
      translations: {
        create: {
          lang: 'bg',
          name: 'Бяла роза',
          description: 'Елегантна бяла роза, височина 70см',
        },
      },
    },
  });

  const tulip = await prisma.flower.upsert({
    where: { sku: 'FL-0003' },
    update: {},
    create: {
      sku: 'FL-0003',
      categoryId: flowersSubcat.id,
      priceCost: 1.0,
      markup: 2.5,
      price: 2.5,
      images: [],
      translations: {
        create: {
          lang: 'bg',
          name: 'Лале',
          description: 'Свежо холандско лале',
        },
      },
    },
  });

  const eucalyptus = await prisma.flower.upsert({
    where: { sku: 'FL-0004' },
    update: {},
    create: {
      sku: 'FL-0004',
      categoryId: greenerySubcat.id,
      priceCost: 0.5,
      markup: 2.0,
      price: 1.0,
      images: [],
      translations: {
        create: {
          lang: 'bg',
          name: 'Евкалипт',
          description: 'Декоративна зеленина за букети',
        },
      },
    },
  });

  console.log('✅ Тестовые цветы созданы');

  // Создаем упаковочные материалы
  const redPaper = await prisma.packaging.upsert({
    where: { sku: 'PK-0001' },
    update: {},
    create: {
      sku: 'PK-0001',
      categoryId: paperSubcat.id,
      colorId: redColor.id,
      isTransparent: false,
      hasInscriptions: false,
      unit: 'piece',
      pricePerUnit: 0.5,
      images: [],
      translations: {
        create: {
          lang: 'bg',
          name: 'Червена опаковъчна хартия',
          description: 'Хартия за опаковане на букети',
        },
      },
    },
  });

  const clearFilm = await prisma.packaging.upsert({
    where: { sku: 'PK-0002' },
    update: {},
    create: {
      sku: 'PK-0002',
      categoryId: filmSubcat.id,
      colorId: null,
      isTransparent: true,
      hasInscriptions: false,
      unit: 'meter',
      pricePerUnit: 0.3,
      images: [],
      translations: {
        create: {
          lang: 'bg',
          name: 'Прозрачно фолио',
          description: 'Целофаново фолио за опаковане',
        },
      },
    },
  });

  const satinRibbon = await prisma.packaging.upsert({
    where: { sku: 'PK-0003' },
    update: {},
    create: {
      sku: 'PK-0003',
      categoryId: ribbonSubcat.id,
      colorId: redColor.id,
      isTransparent: false,
      hasInscriptions: true,
      unit: 'meter',
      pricePerUnit: 0.8,
      images: [],
      translations: {
        create: {
          lang: 'bg',
          name: 'Сатенена лента',
          description: 'Лента за декорация на букети',
        },
      },
    },
  });

  console.log('✅ Упаковочные материалы созданы');

  // Создаем тестовый букет
  const bouquet = await prisma.bouquet.upsert({
    where: { sku: 'BQ-0001' },
    update: {},
    create: {
      sku: 'BQ-0001',
      categoryId: bouquetsCat.id,
      priceBase: 20.0, // будет пересчитано
      extraCharge: 5.0,
      discountPercent: 10,
      priceOld: 25.0,
      price: 22.5, // (20 + 5) * 0.9
      size: 'M',
      images: [],
      translations: {
        create: {
          lang: 'bg',
          name: 'Романтичен букет',
          description: 'Красив букет от червени и бели рози с декоративна зеленина',
        },
      },
      flowers: {
        create: [
          { flowerId: redRose.id, quantity: 5 },
          { flowerId: whiteRose.id, quantity: 4 },
          { flowerId: eucalyptus.id, quantity: 3 },
        ],
      },
      materials: {
        create: [
          { packagingId: redPaper.id, quantity: 2 },
          { packagingId: satinRibbon.id, quantity: 1 },
        ],
      },
    },
  });

  console.log('✅ Тестовый букет создан:', bouquet.sku);

  console.log('🎉 Посев данных завершен успешно!');
  console.log(`
  Учетные данные администратора:
  - Username: ${admin.username}
  - Password: ${adminPassword}
  - Email: ${admin.email}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при посеве данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

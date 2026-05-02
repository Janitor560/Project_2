import { PrismaClient, Role, ProductCategory, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ─── Users ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  const vendorPassword = await bcrypt.hash('vendor123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@awardsplatform.com' },
    update: {},
    create: {
      name: 'HQ Admin',
      email: 'admin@awardsplatform.com',
      password: adminPassword,
      role: Role.ADMIN,
      address: '100 Main Street, New York, NY 10001',
      lat: 40.7128,
      lng: -74.006,
    },
  });

  const vendorUser1 = await prisma.user.upsert({
    where: { email: 'vendor1@awardsplatform.com' },
    update: {},
    create: {
      name: 'Chicago Awards Co.',
      email: 'vendor1@awardsplatform.com',
      password: vendorPassword,
      role: Role.VENDOR,
      address: '200 W Madison St, Chicago, IL 60606',
      lat: 41.8781,
      lng: -87.6298,
    },
  });

  const vendorUser2 = await prisma.user.upsert({
    where: { email: 'vendor2@awardsplatform.com' },
    update: {},
    create: {
      name: 'LA Trophies & Apparel',
      email: 'vendor2@awardsplatform.com',
      password: vendorPassword,
      role: Role.VENDOR,
      address: '350 S Grand Ave, Los Angeles, CA 90071',
      lat: 34.0522,
      lng: -118.2437,
    },
  });

  const vendorUser3 = await prisma.user.upsert({
    where: { email: 'vendor3@awardsplatform.com' },
    update: {},
    create: {
      name: 'Dallas Custom Awards',
      email: 'vendor3@awardsplatform.com',
      password: vendorPassword,
      role: Role.VENDOR,
      address: '1700 Pacific Ave, Dallas, TX 75201',
      lat: 32.7767,
      lng: -96.797,
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'customer@example.com',
      password: customerPassword,
      role: Role.CUSTOMER,
      address: '123 Oak Ave, Indianapolis, IN 46201',
      lat: 39.7684,
      lng: -86.1581,
    },
  });

  console.log('✅ Users created');

  // ─── Vendors ──────────────────────────────────────────────────────────────
  const hqVendor = await prisma.vendor.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      name: 'HQ Fulfillment Center',
      email: 'fulfillment@awardsplatform.com',
      phone: '+1-212-555-0100',
      address: '100 Main Street, New York, NY 10001',
      lat: 40.7128,
      lng: -74.006,
      serviceRadius: 500,
      isHQ: true,
      isActive: true,
      capacity: 500,
      serviceAreas: ['Northeast', 'Mid-Atlantic', 'National'],
    },
  });

  const chicagoVendor = await prisma.vendor.upsert({
    where: { userId: vendorUser1.id },
    update: {},
    create: {
      userId: vendorUser1.id,
      name: 'Chicago Awards Co.',
      email: 'vendor1@awardsplatform.com',
      phone: '+1-312-555-0101',
      address: '200 W Madison St, Chicago, IL 60606',
      lat: 41.8781,
      lng: -87.6298,
      serviceRadius: 300,
      isHQ: false,
      isActive: true,
      capacity: 150,
      serviceAreas: ['Midwest', 'Great Lakes'],
    },
  });

  const laVendor = await prisma.vendor.upsert({
    where: { userId: vendorUser2.id },
    update: {},
    create: {
      userId: vendorUser2.id,
      name: 'LA Trophies & Apparel',
      email: 'vendor2@awardsplatform.com',
      phone: '+1-213-555-0102',
      address: '350 S Grand Ave, Los Angeles, CA 90071',
      lat: 34.0522,
      lng: -118.2437,
      serviceRadius: 400,
      isHQ: false,
      isActive: true,
      capacity: 200,
      serviceAreas: ['West Coast', 'Southwest'],
    },
  });

  const dallasVendor = await prisma.vendor.upsert({
    where: { userId: vendorUser3.id },
    update: {},
    create: {
      userId: vendorUser3.id,
      name: 'Dallas Custom Awards',
      email: 'vendor3@awardsplatform.com',
      phone: '+1-214-555-0103',
      address: '1700 Pacific Ave, Dallas, TX 75201',
      lat: 32.7767,
      lng: -96.797,
      serviceRadius: 350,
      isHQ: false,
      isActive: true,
      capacity: 120,
      serviceAreas: ['South', 'Southwest'],
    },
  });

  console.log('✅ Vendors created');

  // ─── Products ─────────────────────────────────────────────────────────────
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'prod_trophy_gold' },
      update: {},
      create: {
        id: 'prod_trophy_gold',
        name: 'Gold Championship Trophy',
        category: ProductCategory.TROPHY,
        description: 'Premium gold-plated championship trophy with marble base. Perfect for sports and corporate events.',
        basePrice: 49.99,
        imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400',
        customizableFields: {
          text: { label: 'Engraved Text', maxLength: 100 },
          font: { options: ['Arial', 'Times New Roman', 'Playfair Display', 'Roboto'] },
          size: { options: ['Small (8")', 'Medium (12")', 'Large (16")', 'XL (20")'], priceModifier: [0, 15, 30, 50] },
          logoUpload: { enabled: true, label: 'Team Logo' },
        },
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod_trophy_silver' },
      update: {},
      create: {
        id: 'prod_trophy_silver',
        name: 'Silver Excellence Trophy',
        category: ProductCategory.TROPHY,
        description: 'Elegant silver trophy with crystal accents. Ideal for academic and professional recognition.',
        basePrice: 39.99,
        imageUrl: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=400',
        customizableFields: {
          text: { label: 'Engraved Text', maxLength: 100 },
          font: { options: ['Arial', 'Times New Roman', 'Playfair Display', 'Roboto'] },
          size: { options: ['Small (8")', 'Medium (12")', 'Large (16")'], priceModifier: [0, 12, 25] },
          logoUpload: { enabled: true, label: 'Organization Logo' },
        },
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod_medal_gold' },
      update: {},
      create: {
        id: 'prod_medal_gold',
        name: 'Gold Achievement Medal',
        category: ProductCategory.MEDAL,
        description: 'Die-cast gold medal with ribbon. Available in custom colors and designs.',
        basePrice: 8.99,
        imageUrl: 'https://images.unsplash.com/photo-1569437061241-a848be43cc82?w=400',
        customizableFields: {
          text: { label: 'Medal Text', maxLength: 50 },
          ribbonColor: { options: ['Red', 'Blue', 'Green', 'Gold', 'Purple', 'Custom'], label: 'Ribbon Color' },
          logoUpload: { enabled: true, label: 'Custom Design' },
          quantity: { min: 10, priceBreaks: [{ qty: 50, discount: 0.1 }, { qty: 100, discount: 0.2 }] },
        },
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod_plaque_wood' },
      update: {},
      create: {
        id: 'prod_plaque_wood',
        name: 'Walnut Wood Plaque',
        category: ProductCategory.PLAQUE,
        description: 'Premium walnut wood plaque with laser engraving. Timeless recognition award.',
        basePrice: 34.99,
        imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
        customizableFields: {
          text: { label: 'Plaque Text', maxLength: 200 },
          font: { options: ['Arial', 'Times New Roman', 'Playfair Display', 'Script MT'] },
          size: { options: ['8"x10"', '10"x13"', '12"x15"'], priceModifier: [0, 10, 20] },
          logoUpload: { enabled: true, label: 'Company Logo' },
          border: { options: ['Classic', 'Modern', 'Ornate', 'Minimalist'] },
        },
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod_jersey_custom' },
      update: {},
      create: {
        id: 'prod_jersey_custom',
        name: 'Custom Team Jersey',
        category: ProductCategory.JERSEY,
        description: 'Moisture-wicking performance jersey with full custom printing. Available in all sizes.',
        basePrice: 29.99,
        imageUrl: 'https://images.unsplash.com/photo-1562114808-b4b33cf6e67b?w=400',
        customizableFields: {
          text: { label: 'Player Name & Number', maxLength: 30 },
          color: { label: 'Jersey Color', type: 'colorPicker' },
          size: { options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], priceModifier: [0, 0, 0, 0, 0, 5, 8] },
          logoUpload: { enabled: true, label: 'Team Logo' },
          fabric: { options: ['Standard Polyester', 'Dri-FIT Premium', 'Mesh Performance'], priceModifier: [0, 8, 12] },
        },
        isActive: true,
      },
    }),
    prisma.product.upsert({
      where: { id: 'prod_hoodie_custom' },
      update: {},
      create: {
        id: 'prod_hoodie_custom',
        name: 'Custom Team Hoodie',
        category: ProductCategory.HOODIE,
        description: 'Premium pullover hoodie with embroidered or printed customization. 80% cotton, 20% polyester.',
        basePrice: 44.99,
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400',
        customizableFields: {
          text: { label: 'Custom Text', maxLength: 50 },
          color: { label: 'Hoodie Color', type: 'colorPicker' },
          size: { options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'], priceModifier: [0, 0, 0, 0, 0, 5, 8] },
          logoUpload: { enabled: true, label: 'Design/Logo' },
          printMethod: { options: ['Screen Print', 'Embroidery', 'Direct-to-Garment'], priceModifier: [0, 10, 5] },
        },
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Products created');

  // ─── Inventory ────────────────────────────────────────────────────────────
  const allVendors = [hqVendor, chicagoVendor, laVendor, dallasVendor];
  const stockLevels: Record<string, number[]> = {
    prod_trophy_gold:   [200, 50, 75, 40],
    prod_trophy_silver: [150, 40, 60, 35],
    prod_medal_gold:    [5000, 2000, 3000, 1500],
    prod_plaque_wood:   [300, 80, 120, 60],
    prod_jersey_custom: [500, 150, 250, 120],
    prod_hoodie_custom: [400, 100, 180, 90],
  };

  for (const product of products) {
    for (let i = 0; i < allVendors.length; i++) {
      await prisma.inventory.upsert({
        where: { vendorId_productId: { vendorId: allVendors[i].id, productId: product.id } },
        update: {},
        create: {
          vendorId: allVendors[i].id,
          productId: product.id,
          stock: stockLevels[product.id]?.[i] ?? 50,
        },
      });
    }
  }

  console.log('✅ Inventory created');

  // ─── Sample Orders ────────────────────────────────────────────────────────
  const order1 = await prisma.order.create({
    data: {
      userId: customer1.id,
      assignedVendorId: chicagoVendor.id,
      status: OrderStatus.IN_PRODUCTION,
      totalPrice: 89.98,
      customerLat: 39.7684,
      customerLng: -86.1581,
      customerAddress: '123 Oak Ave, Indianapolis, IN 46201',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isExpressDelivery: false,
      routingNotes: 'Assigned to Chicago vendor – closest with sufficient stock',
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            unitPrice: 49.99,
            customizations: { text: 'Best Coach 2024', font: 'Playfair Display', size: 'Medium (12")' },
          },
          {
            productId: products[2].id,
            quantity: 5,
            unitPrice: 7.99,
            customizations: { text: 'Indianapolis Tigers', ribbonColor: 'Blue' },
          },
        ],
      },
      designs: {
        create: [
          {
            text: 'Best Coach 2024',
            font: 'Playfair Display',
            color: '#gold',
            fontSize: 18,
            layoutData: { position: 'center', alignment: 'center' },
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: customer1.id,
      assignedVendorId: hqVendor.id,
      status: OrderStatus.SHIPPED,
      totalPrice: 179.94,
      customerLat: 39.7684,
      customerLng: -86.1581,
      customerAddress: '123 Oak Ave, Indianapolis, IN 46201',
      estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      isExpressDelivery: true,
      routingNotes: 'Express delivery – routed through HQ',
      items: {
        create: [
          {
            productId: products[4].id,
            quantity: 6,
            unitPrice: 29.99,
            customizations: { text: 'Tigers #10', color: '#1a56db', size: 'M', fabric: 'Dri-FIT Premium' },
          },
        ],
      },
    },
  });

  console.log('✅ Sample orders created');

  // ─── Notifications ────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        orderId: order1.id,
        userId: customer1.id,
        type: 'ORDER_UPDATE',
        title: 'Order In Production',
        message: 'Your order #' + order1.id.slice(-6).toUpperCase() + ' is now in production at Chicago Awards Co.',
        isRead: false,
      },
      {
        orderId: order2.id,
        userId: customer1.id,
        type: 'ORDER_UPDATE',
        title: 'Order Shipped',
        message: 'Your order #' + order2.id.slice(-6).toUpperCase() + ' has been shipped! Estimated delivery: tomorrow.',
        isRead: true,
      },
    ],
  });

  console.log('✅ Notifications created');
  console.log('\n🎉 Seed complete!');
  console.log('\nTest credentials:');
  console.log('  Admin:    admin@awardsplatform.com / admin123');
  console.log('  Vendor:   vendor1@awardsplatform.com / vendor123');
  console.log('  Customer: customer@example.com / customer123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

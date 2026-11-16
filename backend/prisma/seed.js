import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PRETWEAR database (clearly labeled SAMPLE/DEMO data)...');

  const password = await bcrypt.hash('Password123!', 10);

  const [admin, manager, customer] = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@pretwear.demo' },
      update: {},
      create: { email: 'admin@pretwear.demo', password, role: 'ADMIN', firstName: 'Admin', lastName: 'Sample', phone: '0550000001' },
    }),
    prisma.user.upsert({
      where: { email: 'manager@pretwear.demo' },
      update: {},
      create: { email: 'manager@pretwear.demo', password, role: 'MANAGER', firstName: 'Manager', lastName: 'Sample', phone: '0550000002' },
    }),
    prisma.user.upsert({
      where: { email: 'customer@pretwear.demo' },
      update: {},
      create: { email: 'customer@pretwear.demo', password, role: 'CUSTOMER', firstName: 'Customer', lastName: 'Sample', phone: '0550000003' },
    }),
  ]);

  const sizeNames = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Adjustable'];
  const sizes = {};
  for (let i = 0; i < sizeNames.length; i++) {
    const name = sizeNames[i];
    sizes[name] = await prisma.size.upsert({ where: { name }, update: { sortOrder: i }, create: { name, sortOrder: i } });
  }

  const colorDefs = [
    ['Black', '#111111'], ['White', '#FFFFFF'], ['Ecru', '#F3EBDD'], ['Navy', '#1F2A44'],
    ['Olive', '#556B2F'], ['Charcoal', '#36454F'], ['Stone', '#C2B280'], ['Bordeaux', '#5C1A2B'],
  ];
  const colors = {};
  for (const [name, hex] of colorDefs) {
    colors[name] = await prisma.color.upsert({ where: { name }, update: { hex }, create: { name, hex } });
  }

  const categoriesData = [
    { name: 'T-Shirts', slug: 't-shirts', description: 'Sample T-shirts category', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Polo Shirts', slug: 'polo-shirts', description: 'Sample Polo Shirts category', imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Caps', slug: 'caps', description: 'Sample Caps category', imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Workwear', slug: 'workwear', description: 'Sample Workwear category', imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1200&auto=format&fit=crop' },
    { name: 'Jackets', slug: 'jackets', description: 'Sample Jackets category', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1200&auto=format&fit=crop' },
  ];
  const categories = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  const products = [
    {
      name: 'Atelier Boxy Heavy Tee 280 GSM (Sample)',
      slug: 'atelier-boxy-heavy-tee-280',
      description: 'Sample demo product: heavyweight cotton tee with boxy fit, customization-ready base.',
      basePrice: 3800,
      salePrice: null,
      categoryId: categories['t-shirts'].id,
      isFeatured: true,
      isCustomizable: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop', alt: 'Sample tee front', sortOrder: 0 },
        { url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1200&auto=format&fit=crop', alt: 'Sample tee detail', sortOrder: 1 },
      ],
      variants: [
        { sku: 'PW-TEE-280-BLK-M', sizeId: sizes['M'].id, colorId: colors['Black'].id, stock: 12 },
        { sku: 'PW-TEE-280-BLK-L', sizeId: sizes['L'].id, colorId: colors['Black'].id, stock: 8 },
        { sku: 'PW-TEE-280-ECR-M', sizeId: sizes['M'].id, colorId: colors['Ecru'].id, stock: 6 },
      ],
    },
    {
      name: 'Atelier Piqué Pro Polo (Sample)',
      slug: 'atelier-pique-pro-polo',
      description: 'Sample demo polo for professional and branded use.',
      basePrice: 4400,
      salePrice: null,
      categoryId: categories['polo-shirts'].id,
      isFeatured: true,
      isCustomizable: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?q=80&w=1200&auto=format&fit=crop', alt: 'Sample polo', sortOrder: 0 },
      ],
      variants: [
        { sku: 'PW-POLO-NVY-M', sizeId: sizes['M'].id, colorId: colors['Navy'].id, stock: 9 },
        { sku: 'PW-POLO-WHT-L', sizeId: sizes['L'].id, colorId: colors['White'].id, stock: 6 },
        { sku: 'PW-POLO-BRD-XL', sizeId: sizes['XL'].id, colorId: colors['Bordeaux'].id, stock: 4 },
      ],
    },
    {
      name: 'Signature Embroidered Cap (Sample)',
      slug: 'signature-embroidered-cap',
      description: 'Sample demo cap with embroidery-ready front panel.',
      basePrice: 2900,
      salePrice: 2600,
      categoryId: categories['caps'].id,
      isFeatured: true,
      isCustomizable: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop', alt: 'Sample cap', sortOrder: 0 },
      ],
      variants: [
        { sku: 'PW-CAP-OLV-ADJ', sizeId: sizes['Adjustable'].id, colorId: colors['Olive'].id, stock: 10 },
        { sku: 'PW-CAP-BLK-ADJ', sizeId: sizes['Adjustable'].id, colorId: colors['Black'].id, stock: 7 },
      ],
    },
    {
      name: 'Nomad Core Hoodie 420 GSM (Sample)',
      slug: 'nomad-core-hoodie-420',
      description: 'Sample demo heavyweight hoodie for streetwear and customization.',
      basePrice: 6900,
      salePrice: null,
      categoryId: categories['jackets'].id,
      isFeatured: false,
      isCustomizable: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop', alt: 'Sample hoodie', sortOrder: 0 },
      ],
      variants: [
        { sku: 'PW-HOOD-CHR-M', sizeId: sizes['M'].id, colorId: colors['Charcoal'].id, stock: 5 },
        { sku: 'PW-HOOD-CHR-L', sizeId: sizes['L'].id, colorId: colors['Charcoal'].id, stock: 3 },
        { sku: 'PW-HOOD-STN-M', sizeId: sizes['M'].id, colorId: colors['Stone'].id, stock: 2 },
      ],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue; // keep seed simple/idempotent
    const { images, variants, ...data } = p;
    await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data });
      await tx.productImage.createMany({ data: images.map((img) => ({ ...img, productId: created.id })) });
      for (const v of variants) {
        const { stock, ...vData } = v;
        const cv = await tx.productVariant.create({ data: { ...vData, productId: created.id } });
        await tx.inventory.create({ data: { variantId: cv.id, quantity: stock, lowStock: 3 } });
      }
    });
  }

  const wilayas = ['16 - Alger', '31 - Oran', '25 - Constantine', '19 - Sétif', '09 - Blida'];
  for (const w of wilayas) {
    const existing = await prisma.deliveryZone.findFirst({ where: { wilaya: w, commune: null } });
    if (existing) {
      await prisma.deliveryZone.update({
        where: { id: existing.id },
        data: { fee: w.startsWith('16') ? 400 : 700, isActive: true },
      });
    } else {
      await prisma.deliveryZone.create({
        data: { wilaya: w, commune: null, fee: w.startsWith('16') ? 400 : 700, isActive: true, etaMinDays: 1, etaMaxDays: w.startsWith('16') ? 2 : 4 },
      });
    }
  }

  await prisma.storeSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessName: 'PRETWEAR (Sample)',
      slogan: 'Wear it. Brand it. Make it yours.',
      address: 'Bordj El Kiffan, Algiers, Algeria',
      phone: '+213 000 000 000 (sample)',
      whatsapp: '+213 000 000 000 (sample)',
      email: 'contact@pretwear.demo',
      socialLinks: { tiktok: 'https://www.tiktok.com/@pretwear' },
      content: { notice: 'All seeded records are clearly labeled SAMPLE/DEMO data for development.' },
    },
  });

  console.log('Seed complete.');
  console.log('Sample accounts (password for all): Password123!');
  console.log('- admin@pretwear.demo (ADMIN)');
  console.log('- manager@pretwear.demo (MANAGER)');
  console.log('- customer@pretwear.demo (CUSTOMER)');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

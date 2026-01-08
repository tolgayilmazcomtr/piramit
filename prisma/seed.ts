import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await bcrypt.hash('admin123', 10)

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@admin.com' },
        update: {},
        create: {
            email: 'admin@admin.com',
            name: 'Admin User',
            password,
            role: 'admin',
        },
    })

    console.log({ admin })

    // Tiers
    await prisma.tier.upsert({
        where: { name: 'Gruplar 1. Seviye' },
        update: {},
        create: { name: 'Gruplar 1. Seviye', requiredScore: 0 }
    })

    await prisma.tier.upsert({
        where: { name: 'Gruplar 2. Seviye' },
        update: {},
        create: { name: 'Gruplar 2. Seviye', requiredScore: 7 }
    })

    // Tags
    const tags = ['Tasarım', 'Video', 'Yazılım', 'Çeviri']
    for (const tag of tags) {
        await prisma.tag.upsert({
            where: { name: tag },
            update: {},
            create: { name: tag }
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

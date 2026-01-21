#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetSubscriptionLimits() {
    try {
        console.log('🔍 Checking current subscription status...\n');

        // Get the most recent user
        const user = await prisma.user.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { subscription: true }
        });

        if (!user) {
            console.log('❌ No users found');
            return;
        }

        console.log(`📧 User: ${user.email}`);

        if (!user.subscription) {
            console.log('❌ No subscription found');
            return;
        }

        console.log(`📊 Current Status:`);
        console.log(`   Plan: ${user.subscription.plan}`);
        console.log(`   Status: ${user.subscription.status}`);
        console.log(`   Podcasts: ${user.subscription.currentPodcastCount} / ${user.subscription.monthlyPodcastLimit}`);
        console.log(`   Minutes: ${user.subscription.currentMinutesUsed} / ${user.subscription.monthlyMinutesLimit}`);

        // Reset the limits
        console.log('\n🔄 Resetting usage limits...');

        const updated = await prisma.subscription.update({
            where: { id: user.subscription.id },
            data: {
                currentPodcastCount: 0,
                currentMinutesUsed: 0
            }
        });

        console.log('\n✅ Limits reset successfully!');
        console.log(`   Podcasts: ${updated.currentPodcastCount} / ${updated.monthlyPodcastLimit}`);
        console.log(`   Minutes: ${updated.currentMinutesUsed} / ${updated.monthlyMinutesLimit}`);
        console.log('\n🎉 You can now create more podcasts!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetSubscriptionLimits();

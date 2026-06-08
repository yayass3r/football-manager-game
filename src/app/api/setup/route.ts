import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// This endpoint initializes the database with seed data
// Call it once after deployment: GET /api/setup
export async function GET() {
  try {
    // Check if already seeded
    const tournamentCount = await prisma.tournament.count();
    
    if (tournamentCount > 0) {
      return NextResponse.json({ 
        status: 'already_initialized',
        message: 'قاعدة البيانات مهيأة بالفعل',
        tournaments: tournamentCount
      });
    }

    // Seed Tournaments
    const tournaments = await Promise.all([
      prisma.tournament.create({
        data: {
          id: 'tourn_diamond',
          name: 'دوري الماس',
          type: 'league',
          tier: 4,
          maxTeams: 16,
          prize: 50000,
          prizeGems: 500,
          season: 1,
          status: 'registration',
        },
      }),
      prisma.tournament.create({
        data: {
          id: 'tourn_gold',
          name: 'دوري الذهب',
          type: 'league',
          tier: 3,
          maxTeams: 16,
          prize: 25000,
          prizeGems: 250,
          season: 1,
          status: 'registration',
        },
      }),
      prisma.tournament.create({
        data: {
          id: 'tourn_silver',
          name: 'دوري الفضة',
          type: 'league',
          tier: 2,
          maxTeams: 16,
          prize: 10000,
          prizeGems: 100,
          season: 1,
          status: 'registration',
        },
      }),
      prisma.tournament.create({
        data: {
          id: 'tourn_bronze',
          name: 'كأس البرونز',
          type: 'cup',
          tier: 1,
          maxTeams: 16,
          prize: 5000,
          prizeGems: 50,
          season: 1,
          status: 'registration',
        },
      }),
    ]);

    // Seed Player Packs
    const packs = await Promise.all([
      prisma.playerPack.create({
        data: {
          id: 'pack_bronze',
          name: 'حزمة برونزية',
          type: 'bronze',
          price: 1000,
          gemPrice: 0,
          description: 'حزمة تحتوي على لاعب بمستوى 55-70',
          minOverall: 55,
          maxOverall: 70,
          playerCount: 1,
        },
      }),
      prisma.playerPack.create({
        data: {
          id: 'pack_silver',
          name: 'حزمة فضية',
          type: 'silver',
          price: 2500,
          gemPrice: 10,
          description: 'حزمة تحتوي على لاعب بمستوى 70-82',
          minOverall: 70,
          maxOverall: 82,
          playerCount: 1,
        },
      }),
      prisma.playerPack.create({
        data: {
          id: 'pack_gold',
          name: 'حزمة ذهبية',
          type: 'gold',
          price: 5000,
          gemPrice: 25,
          description: 'حزمة تحتوي على لاعب بمستوى 82-90',
          minOverall: 82,
          maxOverall: 90,
          playerCount: 1,
        },
      }),
      prisma.playerPack.create({
        data: {
          id: 'pack_legend',
          name: 'حزمة اسطورية',
          type: 'legend',
          price: 0,
          gemPrice: 50,
          description: 'حزمة تحتوي على لاعب بمستوى 90+',
          minOverall: 90,
          maxOverall: 99,
          playerCount: 1,
        },
      }),
    ]);

    // Seed Achievements
    const achievements = await Promise.all([
      prisma.achievement.create({ data: { achievementId: 'first_win', name: 'الفوز الأول', description: 'افز اول مباراة', icon: '🏆', category: 'matches', requirement: 1, rewardCoins: 500 } }),
      prisma.achievement.create({ data: { achievementId: 'win_10', name: 'فارس الملعب', description: 'افز 10 مباريات', icon: '⚔️', category: 'matches', requirement: 10, rewardCoins: 2000, rewardGems: 5 } }),
      prisma.achievement.create({ data: { achievementId: 'win_50', name: 'بطل المستديرة', description: 'افز 50 مباراة', icon: '🥇', category: 'matches', requirement: 50, rewardCoins: 5000, rewardGems: 20, rewardTitle: 'بطل المستديرة' } }),
      prisma.achievement.create({ data: { achievementId: 'champion', name: 'البطل', description: 'افز ببطولة', icon: '👑', category: 'tournaments', requirement: 1, rewardCoins: 10000, rewardGems: 50, rewardTitle: 'البطل' } }),
      prisma.achievement.create({ data: { achievementId: 'rich', name: 'الثري', description: 'اجمع 100,000 عملة', icon: '💰', category: 'economy', requirement: 100000, rewardGems: 10 } }),
      prisma.achievement.create({ data: { achievementId: 'transfer_king', name: 'ملك الانتقالات', description: 'قم بـ 10 صفقات انتقال', icon: '🔄', category: 'transfers', requirement: 10, rewardCoins: 3000, rewardGems: 5 } }),
      prisma.achievement.create({ data: { achievementId: 'pack_opener_10', name: 'فاتح الحزم', description: 'افتح 10 حزم', icon: '📦', category: 'packs', requirement: 10, rewardCoins: 2000, rewardGems: 5 } }),
      prisma.achievement.create({ data: { achievementId: 'trainer', name: 'المدرب', description: 'درب اللاعبين 50 مرة', icon: '🏋️', category: 'training', requirement: 50, rewardCoins: 3000, rewardGems: 10 } }),
      prisma.achievement.create({ data: { achievementId: 'legend', name: 'الاسطورة', description: 'وصل مستوى النادي الى 90+', icon: '⭐', category: 'overall', requirement: 90, rewardCoins: 50000, rewardGems: 100, rewardTitle: 'الاسطورة' } }),
      prisma.achievement.create({ data: { achievementId: 'season_player', name: 'لاعب الموسم', description: 'العب موسم كامل', icon: '📅', category: 'seasons', requirement: 1, rewardCoins: 5000, rewardGems: 20 } }),
      prisma.achievement.create({ data: { achievementId: 'scout', name: 'الكشاف', description: 'اشتر 20 لاعب من السوق', icon: '🔍', category: 'transfers', requirement: 20, rewardCoins: 4000, rewardGems: 10 } }),
      prisma.achievement.create({ data: { achievementId: 'perfect_season', name: 'الموسم المثالي', description: 'افز كل مباريات الموسم', icon: '💎', category: 'tournaments', requirement: 16, rewardCoins: 100000, rewardGems: 200, rewardTitle: 'المثالي' } }),
    ]);

    // Seed Opening Season
    const season = await prisma.season.create({
      data: {
        id: 'season_1',
        number: 1,
        name: 'الموسم الافتتاحي',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        status: 'active',
      },
    });

    // Seed Welcome Event
    const event = await prisma.gameEvent.create({
      data: {
        id: 'event_welcome',
        type: 'welcome',
        title: 'مرحباً بكم في نادي الاسطورة!',
        description: 'اهلاً وسهلاً بكم في اللعبة! استمتعوا بتجربة مميزة',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    });

    return NextResponse.json({
      status: 'success',
      message: 'تم تهيئة قاعدة البيانات بنجاح!',
      data: {
        tournaments: tournaments.length,
        packs: packs.length,
        achievements: achievements.length,
        season: season.id,
        event: event.id,
      },
    });
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'حدث خطأ أثناء التهيئة',
        error: error.message,
        hint: 'تأكد من أن جداول قاعدة البيانات تم إنشاؤها أولاً عبر Supabase SQL Editor باستخدام ملف supabase-init.sql'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

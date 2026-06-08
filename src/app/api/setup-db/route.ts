import { NextResponse } from 'next/server';
import { PrismaClient } from '@/lib/prisma-rest';

async function seedData(): Promise<{ ok: boolean; err?: string; logs: string[] }> {
  const logs: string[] = [];
  const prisma = new PrismaClient();
  
  try {
    // Seed tournaments
    const tournamentCount = await prisma.tournament.count();
    if (tournamentCount === 0) {
      await Promise.all([
        prisma.tournament.create({
          data: { id: 'tourn_diamond', name: 'دوري الماس', type: 'league', tier: 4, maxTeams: 16, prize: 50000, prizeGems: 500, season: 1, status: 'registration' },
        }),
        prisma.tournament.create({
          data: { id: 'tourn_gold', name: 'دوري الذهب', type: 'league', tier: 3, maxTeams: 16, prize: 25000, prizeGems: 250, season: 1, status: 'registration' },
        }),
        prisma.tournament.create({
          data: { id: 'tourn_silver', name: 'دوري الفضة', type: 'league', tier: 2, maxTeams: 16, prize: 10000, prizeGems: 100, season: 1, status: 'registration' },
        }),
        prisma.tournament.create({
          data: { id: 'tourn_bronze', name: 'كأس البرونز', type: 'cup', tier: 1, maxTeams: 16, prize: 5000, prizeGems: 50, season: 1, status: 'registration' },
        }),
      ]);
      logs.push('✅ Tournaments seeded');
    } else {
      logs.push('⏭️ Tournaments already exist');
    }

    // Seed player packs
    const packCount = await prisma.playerPack.count();
    if (packCount === 0) {
      await Promise.all([
        prisma.playerPack.create({
          data: { id: 'pack_bronze', name: 'حزمة برونزية', type: 'bronze', price: 1000, gemPrice: 0, description: 'حزمة تحتوي على لاعب بمستوى 55-70', minOverall: 55, maxOverall: 70, playerCount: 1 },
        }),
        prisma.playerPack.create({
          data: { id: 'pack_silver', name: 'حزمة فضية', type: 'silver', price: 2500, gemPrice: 10, description: 'حزمة تحتوي على لاعب بمستوى 70-82', minOverall: 70, maxOverall: 82, playerCount: 1 },
        }),
        prisma.playerPack.create({
          data: { id: 'pack_gold', name: 'حزمة ذهبية', type: 'gold', price: 5000, gemPrice: 25, description: 'حزمة تحتوي على لاعب بمستوى 82-90', minOverall: 82, maxOverall: 90, playerCount: 1 },
        }),
        prisma.playerPack.create({
          data: { id: 'pack_legend', name: 'حزمة اسطورية', type: 'legend', price: 0, gemPrice: 50, description: 'حزمة تحتوي على لاعب بمستوى 90+', minOverall: 90, maxOverall: 99, playerCount: 1 },
        }),
      ]);
      logs.push('✅ Packs seeded');
    } else {
      logs.push('⏭️ Packs already exist');
    }

    // Seed achievements
    const achievementCount = await prisma.achievement.count();
    if (achievementCount === 0) {
      await Promise.all([
        prisma.achievement.create({ data: { id: 'ach_first_win', achievementId: 'first_win', name: 'الفوز الأول', description: 'افز اول مباراة', icon: '🏆', category: 'matches', requirement: 1, rewardCoins: 500 } }),
        prisma.achievement.create({ data: { id: 'ach_win_10', achievementId: 'win_10', name: 'فارس الملعب', description: 'افز 10 مباريات', icon: '⚔️', category: 'matches', requirement: 10, rewardCoins: 2000, rewardGems: 5 } }),
        prisma.achievement.create({ data: { id: 'ach_win_50', achievementId: 'win_50', name: 'بطل المستديرة', description: 'افز 50 مباراة', icon: '🥇', category: 'matches', requirement: 50, rewardCoins: 5000, rewardGems: 20, rewardTitle: 'بطل المستديرة' } }),
        prisma.achievement.create({ data: { id: 'ach_champion', achievementId: 'champion', name: 'البطل', description: 'افز ببطولة', icon: '👑', category: 'tournaments', requirement: 1, rewardCoins: 10000, rewardGems: 50, rewardTitle: 'البطل' } }),
        prisma.achievement.create({ data: { id: 'ach_rich', achievementId: 'rich', name: 'الثري', description: 'اجمع 100,000 عملة', icon: '💰', category: 'economy', requirement: 100000, rewardGems: 10 } }),
        prisma.achievement.create({ data: { id: 'ach_transfer', achievementId: 'transfer_king', name: 'ملك الانتقالات', description: 'قم بـ 10 صفقات انتقال', icon: '🔄', category: 'transfers', requirement: 10, rewardCoins: 3000, rewardGems: 5 } }),
        prisma.achievement.create({ data: { id: 'ach_pack_10', achievementId: 'pack_opener_10', name: 'فاتح الحزم', description: 'افتح 10 حزم', icon: '📦', category: 'packs', requirement: 10, rewardCoins: 2000, rewardGems: 5 } }),
        prisma.achievement.create({ data: { id: 'ach_trained', achievementId: 'trainer', name: 'المدرب', description: 'درب اللاعبين 50 مرة', icon: '🏋️', category: 'training', requirement: 50, rewardCoins: 3000, rewardGems: 10 } }),
        prisma.achievement.create({ data: { id: 'ach_legend', achievementId: 'legend', name: 'الاسطورة', description: 'وصل مستوى النادي الى 90+', icon: '⭐', category: 'overall', requirement: 90, rewardCoins: 50000, rewardGems: 100, rewardTitle: 'الاسطورة' } }),
        prisma.achievement.create({ data: { id: 'ach_season', achievementId: 'season_player', name: 'لاعب الموسم', description: 'العب موسم كامل', icon: '📅', category: 'seasons', requirement: 1, rewardCoins: 5000, rewardGems: 20 } }),
        prisma.achievement.create({ data: { id: 'ach_scout', achievementId: 'scout', name: 'الكشاف', description: 'اشتر 20 لاعب من السوق', icon: '🔍', category: 'transfers', requirement: 20, rewardCoins: 4000, rewardGems: 10 } }),
        prisma.achievement.create({ data: { id: 'ach_perfect', achievementId: 'perfect_season', name: 'الموسم المثالي', description: 'افز كل مباريات الموسم', icon: '💎', category: 'tournaments', requirement: 16, rewardCoins: 100000, rewardGems: 200, rewardTitle: 'المثالي' } }),
      ]);
      logs.push('✅ Achievements seeded');
    } else {
      logs.push('⏭️ Achievements already exist');
    }

    // Seed season
    const seasonCount = await prisma.season.count();
    if (seasonCount === 0) {
      await prisma.season.create({
        data: { id: 'season_1', number: 1, name: 'الموسم الافتتاحي', startDate: new Date(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), status: 'active' },
      });
      logs.push('✅ Season seeded');
    } else {
      logs.push('⏭️ Season already exists');
    }

    // Seed welcome event
    const eventCount = await prisma.gameEvent.count();
    if (eventCount === 0) {
      await prisma.gameEvent.create({
        data: { id: 'event_welcome', type: 'welcome', title: 'مرحباً بكم في نادي الاسطورة!', description: 'اهلاً وسهلاً بكم في اللعبة! استمتعوا بتجربة مميزة', startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true },
      });
      logs.push('✅ Welcome event seeded');
    } else {
      logs.push('⏭️ Events already exist');
    }

    return { ok: true, logs };
  } catch (error: any) {
    logs.push('❌ Error: ' + (error.message || '').substring(0, 200));
    return { ok: false, err: error.message, logs };
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') !== 'legend-club-setup-2024') {
    return NextResponse.json({ error: 'Add ?secret=legend-club-setup-2024' }, { status: 401 });
  }
  
  const result = await seedData();
  
  return NextResponse.json({ 
    status: result.ok ? 'done' : 'partial', 
    logs: result.logs,
    error: result.err 
  });
}

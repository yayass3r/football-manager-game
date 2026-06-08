import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

// This endpoint initializes the database with schema + seed data
// Call it once after deployment: GET /api/setup
export async function GET() {
  try {
    // Step 1: Push schema to database
    let schemaResult = 'skipped';
    try {
      // First check if tables exist
      const tableCheck = await prisma.$queryRaw`
        SELECT count(*) as count FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      `;
      const count = Number((tableCheck as any[])[0]?.count ?? 0);
      
      if (count === 0) {
        // Tables don't exist, push schema
        console.log('Pushing Prisma schema to database...');
        execSync('npx prisma db push --skip-generate --accept-data-loss', {
          stdio: 'pipe',
          timeout: 60000,
          env: { ...process.env }
        });
        schemaResult = 'pushed';
      } else {
        schemaResult = 'already_exists';
      }
    } catch (schemaError: any) {
      console.error('Schema push error:', schemaError.message);
      // Try alternative: use raw SQL to create tables
      try {
        await createTablesRaw();
        schemaResult = 'created_via_raw_sql';
      } catch (rawError: any) {
        schemaResult = `failed: ${rawError.message}`;
      }
    }

    // Step 2: Check if already seeded
    const tournamentCount = await prisma.tournament.count();
    
    if (tournamentCount > 0) {
      return NextResponse.json({ 
        status: 'already_initialized',
        message: 'قاعدة البيانات مهيأة بالفعل',
        schema: schemaResult,
        tournaments: tournamentCount
      });
    }

    // Step 3: Seed data
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
      schema: schemaResult,
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

// Fallback: Create tables using raw SQL
async function createTablesRaw() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      coins INTEGER DEFAULT 5000,
      gems INTEGER DEFAULT 50,
      level INTEGER DEFAULT 1,
      xp INTEGER DEFAULT 0,
      avatar TEXT DEFAULT '⚽',
      sound_enabled BOOLEAN DEFAULT true,
      total_wins INTEGER DEFAULT 0,
      total_trophies INTEGER DEFAULT 0,
      is_admin BOOLEAN DEFAULT false,
      is_banned BOOLEAN DEFAULT false,
      ban_reason TEXT DEFAULT '',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS clubs (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      logo TEXT DEFAULT '🏟️',
      primary_color TEXT DEFAULT '#1a8f3f',
      secondary_color TEXT DEFAULT '#ffffff',
      formation TEXT DEFAULT '4-3-3',
      morale INTEGER DEFAULT 75,
      reputation INTEGER DEFAULT 50,
      wins INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0,
      stadium_name TEXT DEFAULT 'الملعب الرئيسي',
      stadium_level INTEGER DEFAULT 1,
      kit_style TEXT DEFAULT 'classic',
      kit_pattern TEXT DEFAULT 'plain',
      season_points INTEGER DEFAULT 0,
      season_number INTEGER DEFAULT 1,
      title TEXT DEFAULT '',
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      nationality TEXT NOT NULL,
      age INTEGER NOT NULL,
      overall INTEGER NOT NULL,
      pace INTEGER NOT NULL,
      shooting INTEGER NOT NULL,
      passing INTEGER NOT NULL,
      dribbling INTEGER NOT NULL,
      defending INTEGER NOT NULL,
      physical INTEGER NOT NULL,
      potential INTEGER NOT NULL,
      value INTEGER NOT NULL,
      salary INTEGER NOT NULL,
      morale INTEGER DEFAULT 75,
      fitness INTEGER DEFAULT 100,
      form INTEGER DEFAULT 75,
      is_starter BOOLEAN DEFAULT false,
      shirt_number INTEGER,
      club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      tier INTEGER DEFAULT 1,
      max_teams INTEGER DEFAULT 16,
      prize INTEGER NOT NULL,
      prize_gems INTEGER DEFAULT 0,
      season INTEGER DEFAULT 1,
      status TEXT DEFAULT 'registration',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS tournament_participants (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      tournament_id TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
      club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
      group_number INTEGER DEFAULT 1,
      points INTEGER DEFAULT 0,
      played INTEGER DEFAULT 0,
      won INTEGER DEFAULT 0,
      drawn INTEGER DEFAULT 0,
      lost INTEGER DEFAULT 0,
      gf INTEGER DEFAULT 0,
      ga INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(tournament_id, club_id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      tournament_id TEXT REFERENCES tournaments(id) ON DELETE CASCADE,
      home_club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
      away_club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
      home_goals INTEGER DEFAULT 0,
      away_goals INTEGER DEFAULT 0,
      status TEXT DEFAULT 'scheduled',
      match_day INTEGER DEFAULT 1,
      events TEXT DEFAULT '[]',
      played_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS transfer_listings (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      seller_club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
      price INTEGER NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      achievement_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      requirement INTEGER NOT NULL,
      reward_coins INTEGER DEFAULT 0,
      reward_gems INTEGER DEFAULT 0,
      reward_title TEXT
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      achievement_id TEXT NOT NULL REFERENCES achievements(achievement_id) ON DELETE CASCADE,
      unlocked BOOLEAN DEFAULT false,
      claimed BOOLEAN DEFAULT false,
      unlocked_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, achievement_id)
    );

    CREATE TABLE IF NOT EXISTS game_events (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      start_date TIMESTAMPTZ NOT NULL,
      end_date TIMESTAMPTZ NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS player_packs (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      price INTEGER NOT NULL,
      gem_price INTEGER DEFAULT 0,
      description TEXT NOT NULL,
      min_overall INTEGER NOT NULL,
      max_overall INTEGER NOT NULL,
      player_count INTEGER DEFAULT 1,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS pack_openings (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      pack_id TEXT NOT NULL REFERENCES player_packs(id) ON DELETE CASCADE,
      players_data TEXT NOT NULL,
      opened_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS seasons (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      number INTEGER NOT NULL,
      name TEXT NOT NULL,
      start_date TIMESTAMPTZ NOT NULL,
      end_date TIMESTAMPTZ NOT NULL,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
      season_id TEXT REFERENCES seasons(id),
      type TEXT NOT NULL,
      score INTEGER NOT NULL,
      rank INTEGER DEFAULT 0,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  
  await prisma.$executeRawUnsafe(sql);
}

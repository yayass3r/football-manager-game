import { NextResponse } from 'next/server'
import { Client } from 'pg'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('secret') !== 'legend-club-setup-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: string[] = []
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
  }
  
  results.push(`DB URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`)
  
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  })

  try {
    await client.connect()
    results.push('✅ Connected to database')
  } catch (connectError: any) {
    results.push(`❌ Connection failed: ${connectError.message}`)
    const directUrl = process.env.DIRECT_URL
    if (directUrl) {
      results.push(`Trying DIRECT_URL: ${directUrl.replace(/:[^:@]+@/, ':****@')}`)
      const client2 = new Client({
        connectionString: directUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      })
      try {
        await client2.connect()
        results.push('✅ Connected with DIRECT_URL')
        return await setupWithClient(client2, results)
      } catch (e2: any) {
        results.push(`❌ DIRECT_URL also failed: ${e2.message}`)
        return NextResponse.json({ results }, { status: 500 })
      }
    }
    return NextResponse.json({ results }, { status: 500 })
  }

  return await setupWithClient(client, results)
}

async function setupWithClient(client: Client, results: string[]) {
  try {
    const { rows } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name")
    results.push(`Existing tables: ${rows.map((r: any) => r.table_name).join(', ') || 'NONE'}`)
    if (rows.length > 0 && rows.some((r: any) => r.table_name === 'users')) {
      results.push('✅ Tables already exist')
      await client.end()
      return NextResponse.json({ results })
    }
  } catch (e: any) {
    results.push(`Table check error: ${e.message.substring(0, 80)}`)
  }

  const stmts = [
`CREATE TABLE IF NOT EXISTS "users" ("id" TEXT NOT NULL, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "coins" INTEGER NOT NULL DEFAULT 5000, "gems" INTEGER NOT NULL DEFAULT 50, "level" INTEGER NOT NULL DEFAULT 1, "xp" INTEGER NOT NULL DEFAULT 0, "avatar" TEXT NOT NULL DEFAULT '⚽', "soundEnabled" BOOLEAN NOT NULL DEFAULT true, "totalWins" INTEGER NOT NULL DEFAULT 0, "totalTrophies" INTEGER NOT NULL DEFAULT 0, "isAdmin" BOOLEAN NOT NULL DEFAULT false, "isBanned" BOOLEAN NOT NULL DEFAULT false, "banReason" TEXT NOT NULL DEFAULT '', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "users_pkey" PRIMARY KEY ("id"))`,
`CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username")`,
`CREATE TABLE IF NOT EXISTS "clubs" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "logo" TEXT NOT NULL DEFAULT '🏟️', "primary_color" TEXT NOT NULL DEFAULT '#1a8f3f', "secondary_color" TEXT NOT NULL DEFAULT '#ffffff', "formation" TEXT NOT NULL DEFAULT '4-3-3', "morale" INTEGER NOT NULL DEFAULT 75, "reputation" INTEGER NOT NULL DEFAULT 50, "wins" INTEGER NOT NULL DEFAULT 0, "draws" INTEGER NOT NULL DEFAULT 0, "losses" INTEGER NOT NULL DEFAULT 0, "goals_for" INTEGER NOT NULL DEFAULT 0, "goals_against" INTEGER NOT NULL DEFAULT 0, "stadium_name" TEXT NOT NULL DEFAULT 'الملعب الرئيسي', "stadium_level" INTEGER NOT NULL DEFAULT 1, "kit_style" TEXT NOT NULL DEFAULT 'classic', "kit_pattern" TEXT NOT NULL DEFAULT 'plain', "season_points" INTEGER NOT NULL DEFAULT 0, "season_number" INTEGER NOT NULL DEFAULT 1, "title" TEXT NOT NULL DEFAULT '', "user_id" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "clubs_pkey" PRIMARY KEY ("id"))`,
`CREATE UNIQUE INDEX IF NOT EXISTS "clubs_user_id_key" ON "clubs"("user_id")`,
`CREATE TABLE IF NOT EXISTS "players" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "position" TEXT NOT NULL, "nationality" TEXT NOT NULL, "age" INTEGER NOT NULL, "overall" INTEGER NOT NULL, "pace" INTEGER NOT NULL, "shooting" INTEGER NOT NULL, "passing" INTEGER NOT NULL, "dribbling" INTEGER NOT NULL, "defending" INTEGER NOT NULL, "physical" INTEGER NOT NULL, "potential" INTEGER NOT NULL, "value" INTEGER NOT NULL, "salary" INTEGER NOT NULL, "morale" INTEGER NOT NULL DEFAULT 75, "fitness" INTEGER NOT NULL DEFAULT 100, "form" INTEGER NOT NULL DEFAULT 75, "is_starter" BOOLEAN NOT NULL DEFAULT false, "shirt_number" INTEGER, "club_id" TEXT NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "players_pkey" PRIMARY KEY ("id"))`,
`CREATE TABLE IF NOT EXISTS "tournaments" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "type" TEXT NOT NULL, "tier" INTEGER NOT NULL DEFAULT 1, "max_teams" INTEGER NOT NULL DEFAULT 16, "prize" INTEGER NOT NULL, "prize_gems" INTEGER NOT NULL DEFAULT 0, "season" INTEGER NOT NULL DEFAULT 1, "status" TEXT NOT NULL DEFAULT 'registration', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id"))`,
`CREATE TABLE IF NOT EXISTS "tournament_participants" ("id" TEXT NOT NULL, "tournament_id" TEXT NOT NULL, "club_id" TEXT NOT NULL, "group_number" INTEGER NOT NULL DEFAULT 1, "points" INTEGER NOT NULL DEFAULT 0, "played" INTEGER NOT NULL DEFAULT 0, "won" INTEGER NOT NULL DEFAULT 0, "drawn" INTEGER NOT NULL DEFAULT 0, "lost" INTEGER NOT NULL DEFAULT 0, "gf" INTEGER NOT NULL DEFAULT 0, "ga" INTEGER NOT NULL DEFAULT 0, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "tournament_participants_pkey" PRIMARY KEY ("id"))`,
`CREATE UNIQUE INDEX IF NOT EXISTS "tournament_participants_tournament_id_club_id_key" ON "tournament_participants"("tournament_id", "club_id")`,
`CREATE TABLE IF NOT EXISTS "matches" ("id" TEXT NOT NULL, "tournament_id" TEXT, "home_club_id" TEXT NOT NULL, "away_club_id" TEXT NOT NULL, "home_goals" INTEGER NOT NULL DEFAULT 0, "away_goals" INTEGER NOT NULL DEFAULT 0, "status" TEXT NOT NULL DEFAULT 'scheduled', "match_day" INTEGER NOT NULL DEFAULT 1, "events" TEXT NOT NULL DEFAULT '[]', "played_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "matches_pkey" PRIMARY KEY ("id"))`,
`CREATE TABLE IF NOT EXISTS "transfer_listings" ("id" TEXT NOT NULL, "player_id" TEXT NOT NULL, "seller_club_id" TEXT NOT NULL, "price" INTEGER NOT NULL, "status" TEXT NOT NULL DEFAULT 'active', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "transfer_listings_pkey" PRIMARY KEY ("id"))`,
`CREATE TABLE IF NOT EXISTS "achievements" ("id" TEXT NOT NULL, "achievement_id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL, "icon" TEXT NOT NULL, "category" TEXT NOT NULL, "requirement" INTEGER NOT NULL, "reward_coins" INTEGER NOT NULL DEFAULT 0, "reward_gems" INTEGER NOT NULL DEFAULT 0, "reward_title" TEXT, CONSTRAINT "achievements_pkey" PRIMARY KEY ("id"))`,
`CREATE UNIQUE INDEX IF NOT EXISTS "achievements_achievement_id_key" ON "achievements"("achievement_id")`,
`CREATE TABLE IF NOT EXISTS "user_achievements" ("id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "achievement_id" TEXT NOT NULL, "unlocked" BOOLEAN NOT NULL DEFAULT false, "claimed" BOOLEAN NOT NULL DEFAULT false, "unlocked_at" TIMESTAMP(3), "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id"))`,
`CREATE UNIQUE INDEX IF NOT EXISTS "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id")`,
`CREATE TABLE IF NOT EXISTS "game_events" ("id" TEXT NOT NULL, "type" TEXT NOT NULL, "title" TEXT NOT NULL, "description" TEXT NOT NULL, "start_date" TIMESTAMP(3) NOT NULL, "end_date" TIMESTAMP(3) NOT NULL, "is_active" BOOLEAN NOT NULL DEFAULT true, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "game_events_pkey" PRIMARY KEY ("id"))`,
`CREATE TABLE IF NOT EXISTS "player_packs" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "type" TEXT NOT NULL, "price" INTEGER NOT NULL, "gem_price" INTEGER NOT NULL DEFAULT 0, "description" TEXT NOT NULL, "min_overall" INTEGER NOT NULL, "max_overall" INTEGER NOT NULL, "player_count" INTEGER NOT NULL DEFAULT 1, "is_active" BOOLEAN NOT NULL DEFAULT true, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "player_packs_pkey" PRIMARY KEY ("id"))`,
`CREATE TABLE IF NOT EXISTS "pack_openings" ("id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "pack_id" TEXT NOT NULL, "players_data" TEXT NOT NULL, "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "pack_openings_pkey" PRIMARY KEY ("id"))`,
`CREATE TABLE IF NOT EXISTS "seasons" ("id" TEXT NOT NULL, "number" INTEGER NOT NULL, "name" TEXT NOT NULL, "start_date" TIMESTAMP(3) NOT NULL, "end_date" TIMESTAMP(3) NOT NULL, "status" TEXT NOT NULL DEFAULT 'active', "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "seasons_pkey" PRIMARY KEY ("id"))`,
`CREATE TABLE IF NOT EXISTS "leaderboard_entries" ("id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "club_id" TEXT NOT NULL, "season_id" TEXT, "type" TEXT NOT NULL, "score" INTEGER NOT NULL, "rank" INTEGER NOT NULL DEFAULT 0, "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id"))`,
`ALTER TABLE "clubs" DROP CONSTRAINT IF EXISTS "clubs_user_id_fkey"; ALTER TABLE "clubs" ADD CONSTRAINT "clubs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "players" DROP CONSTRAINT IF EXISTS "players_club_id_fkey"; ALTER TABLE "players" ADD CONSTRAINT "players_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "tournament_participants" DROP CONSTRAINT IF EXISTS "tournament_participants_tournament_id_fkey"; ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "tournament_participants" DROP CONSTRAINT IF EXISTS "tournament_participants_club_id_fkey"; ALTER TABLE "tournament_participants" ADD CONSTRAINT "tournament_participants_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_tournament_id_fkey"; ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_home_club_id_fkey"; ALTER TABLE "matches" ADD CONSTRAINT "matches_home_club_id_fkey" FOREIGN KEY ("home_club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "matches" DROP CONSTRAINT IF EXISTS "matches_away_club_id_fkey"; ALTER TABLE "matches" ADD CONSTRAINT "matches_away_club_id_fkey" FOREIGN KEY ("away_club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "transfer_listings" DROP CONSTRAINT IF EXISTS "transfer_listings_player_id_fkey"; ALTER TABLE "transfer_listings" ADD CONSTRAINT "transfer_listings_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "transfer_listings" DROP CONSTRAINT IF EXISTS "transfer_listings_seller_club_id_fkey"; ALTER TABLE "transfer_listings" ADD CONSTRAINT "transfer_listings_seller_club_id_fkey" FOREIGN KEY ("seller_club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "user_achievements" DROP CONSTRAINT IF EXISTS "user_achievements_user_id_fkey"; ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "user_achievements" DROP CONSTRAINT IF EXISTS "user_achievements_achievement_id_fkey"; ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("achievement_id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "pack_openings" DROP CONSTRAINT IF EXISTS "pack_openings_user_id_fkey"; ALTER TABLE "pack_openings" ADD CONSTRAINT "pack_openings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "pack_openings" DROP CONSTRAINT IF EXISTS "pack_openings_pack_id_fkey"; ALTER TABLE "pack_openings" ADD CONSTRAINT "pack_openings_pack_id_fkey" FOREIGN KEY ("pack_id") REFERENCES "player_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "leaderboard_entries" DROP CONSTRAINT IF EXISTS "leaderboard_entries_user_id_fkey"; ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`ALTER TABLE "leaderboard_entries" DROP CONSTRAINT IF EXISTS "leaderboard_entries_club_id_fkey"; ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
`INSERT INTO "tournaments" ("id", "name", "type", "tier", "max_teams", "prize", "prize_gems", "season", "status") VALUES ('tourn_diamond', 'دوري الماس', 'league', 4, 16, 50000, 500, 1, 'registration'), ('tourn_gold', 'دوري الذهب', 'league', 3, 16, 25000, 250, 1, 'registration'), ('tourn_silver', 'دوري الفضة', 'league', 2, 16, 10000, 100, 1, 'registration'), ('tourn_bronze', 'كأس البرونز', 'cup', 1, 16, 5000, 50, 1, 'registration') ON CONFLICT ("id") DO NOTHING`,
`INSERT INTO "player_packs" ("id", "name", "type", "price", "gem_price", "description", "min_overall", "max_overall", "player_count") VALUES ('pack_bronze', 'حزمة برونزية', 'bronze', 1000, 0, 'حزمة تحتوي على لاعب بمستوى 55-70', 55, 70, 1), ('pack_silver', 'حزمة فضية', 'silver', 2500, 10, 'حزمة تحتوي على لاعب بمستوى 70-82', 70, 82, 1), ('pack_gold', 'حزمة ذهبية', 'gold', 5000, 25, 'حزمة تحتوي على لاعب بمستوى 82-90', 82, 90, 1), ('pack_legend', 'حزمة اسطورية', 'legend', 0, 50, 'حزمة تحتوي على لاعب بمستوى 90+', 90, 99, 1) ON CONFLICT ("id") DO NOTHING`,
`INSERT INTO "achievements" ("id", "achievement_id", "name", "description", "icon", "category", "requirement", "reward_coins", "reward_gems", "reward_title") VALUES ('ach_first_win', 'first_win', 'الفوز الأول', 'افز اول مباراة', '🏆', 'matches', 1, 500, 0, NULL), ('ach_win_10', 'win_10', 'فارس الملعب', 'افز 10 مباريات', '⚔️', 'matches', 10, 2000, 5, NULL), ('ach_win_50', 'win_50', 'بطل المستديرة', 'افز 50 مباراة', '🥇', 'matches', 50, 5000, 20, 'بطل المستديرة'), ('ach_champion', 'champion', 'البطل', 'افز ببطولة', '👑', 'tournaments', 1, 10000, 50, 'البطل'), ('ach_rich', 'rich', 'الثري', 'اجمع 100,000 عملة', '💰', 'economy', 100000, 0, 10, NULL), ('ach_transfer', 'transfer_king', 'ملك الانتقالات', 'قم بـ 10 صفقات انتقال', '🔄', 'transfers', 10, 3000, 5, NULL), ('ach_pack_10', 'pack_opener_10', 'فاتح الحزم', 'افتح 10 حزم', '📦', 'packs', 10, 2000, 5, NULL), ('ach_trained', 'trainer', 'المدرب', 'درب اللاعبين 50 مرة', '🏋️', 'training', 50, 3000, 10, NULL), ('ach_legend', 'legend', 'الاسطورة', 'وصل مستوى النادي الى 90+', '⭐', 'overall', 90, 50000, 100, 'الاسطورة'), ('ach_season', 'season_player', 'لاعب الموسم', 'العب موسم كامل', '📅', 'seasons', 1, 5000, 20, NULL), ('ach_scout', 'scout', 'الكشاف', 'اشتر 20 لاعب من السوق', '🔍', 'transfers', 20, 4000, 10, NULL), ('ach_perfect', 'perfect_season', 'الموسم المثالي', 'افز كل مباريات الموسم', '💎', 'tournaments', 16, 100000, 200, 'المثالي') ON CONFLICT ("id") DO NOTHING`,
`INSERT INTO "seasons" ("id", "number", "name", "start_date", "end_date", "status") VALUES ('season_1', 1, 'الموسم الافتتاحي', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', 'active') ON CONFLICT ("id") DO NOTHING`,
`INSERT INTO "game_events" ("id", "type", "title", "description", "start_date", "end_date", "is_active") VALUES ('event_welcome', 'welcome', 'مرحباً بكم في نادي الاسطورة!', 'اهلاً وسهلاً بكم في اللعبة! استمتعوا بتجربة مميزة', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', true) ON CONFLICT ("id") DO NOTHING`,
  ]

  for (const stmt of stmts) {
    try {
      await client.query(stmt)
    } catch (e: any) {
      const msg = e.message?.substring(0, 100) || 'Unknown error'
      if (!msg.includes('already exists') && !msg.includes('duplicate')) {
        results.push(`⚠️ ${msg}`)
      }
    }
  }
  results.push('✅ Setup complete')

  // Verify
  try {
    const { rows } = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name")
    results.push(`Tables: ${rows.map((r: any) => r.table_name).join(', ')}`)
  } catch (e: any) {
    results.push(`Verify: ${e.message.substring(0, 80)}`)
  }

  await client.end()
  return NextResponse.json({ results })
}

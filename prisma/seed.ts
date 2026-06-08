import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء تهيئة قاعدة البيانات...')

  // 1. Create default tournaments
  const existingTournaments = await prisma.tournament.count()
  if (existingTournaments === 0) {
    console.log('🏆 إنشاء البطولات الافتراضية...')
    await prisma.tournament.createMany({
      data: [
        {
          name: 'الدوري المحلي',
          type: 'league',
          tier: 1,
          maxTeams: 16,
          prize: 5000,
          prizeGems: 10,
          season: 1,
          status: 'registration',
        },
        {
          name: 'كأس الاتحاد',
          type: 'cup',
          tier: 2,
          maxTeams: 32,
          prize: 8000,
          prizeGems: 20,
          season: 1,
          status: 'registration',
        },
        {
          name: 'دوري أبطال القارة',
          type: 'champions',
          tier: 3,
          maxTeams: 16,
          prize: 15000,
          prizeGems: 50,
          season: 1,
          status: 'registration',
        },
        {
          name: 'كأس السوبر',
          type: 'super',
          tier: 4,
          maxTeams: 4,
          prize: 25000,
          prizeGems: 100,
          season: 1,
          status: 'registration',
        },
      ],
    })
    console.log('✅ تم إنشاء 4 بطولات')
  }

  // 2. Create default player packs
  const existingPacks = await prisma.playerPack.count()
  if (existingPacks === 0) {
    console.log('🎰 إنشاء الحزم الافتراضية...')
    await prisma.playerPack.createMany({
      data: [
        {
          name: 'حزمة برونزية',
          type: 'bronze',
          price: 1000,
          gemPrice: 0,
          description: 'حزمة أساسية تحتوي على لاعب واحد بتقييم 55-70',
          minOverall: 55,
          maxOverall: 70,
          playerCount: 1,
          isActive: true,
        },
        {
          name: 'حزمة فضية',
          type: 'silver',
          price: 2500,
          gemPrice: 5,
          description: 'حزمة متوسطة تحتوي على لاعبين بتقييم 65-80',
          minOverall: 65,
          maxOverall: 80,
          playerCount: 2,
          isActive: true,
        },
        {
          name: 'حزمة ذهبية',
          type: 'gold',
          price: 5000,
          gemPrice: 15,
          description: 'حزمة ممتازة تحتوي على 3 لاعبين بتقييم 75-88',
          minOverall: 75,
          maxOverall: 88,
          playerCount: 3,
          isActive: true,
        },
        {
          name: 'حزمة أسطورية',
          type: 'legendary',
          price: 0,
          gemPrice: 50,
          description: 'حزمة نادرة تحتوي على لاعب أسطوري بتقييم 85-99',
          minOverall: 85,
          maxOverall: 99,
          playerCount: 1,
          isActive: true,
        },
      ],
    })
    console.log('✅ تم إنشاء 4 حزم')
  }

  // 3. Create default achievements
  const existingAchievements = await prisma.achievement.count()
  if (existingAchievements === 0) {
    console.log('🏅 إنشاء الإنجازات الافتراضية...')
    await prisma.achievement.createMany({
      data: [
        {
          achievementId: 'first_win',
          name: 'أول انتصار',
          description: 'افز أول مباراة',
          icon: '🎉',
          category: 'matches',
          requirement: 1,
          rewardCoins: 500,
          rewardGems: 5,
          rewardTitle: 'بداية مشرفة',
        },
        {
          achievementId: '10_wins',
          name: 'فارس الميدان',
          description: 'اربح 10 مباريات',
          icon: '⚔️',
          category: 'matches',
          requirement: 10,
          rewardCoins: 2000,
          rewardGems: 20,
          rewardTitle: 'فارس الميدان',
        },
        {
          achievementId: '50_wins',
          name: 'القائد الملهم',
          description: 'اربح 50 مباراة',
          icon: '👑',
          category: 'matches',
          requirement: 50,
          rewardCoins: 10000,
          rewardGems: 100,
          rewardTitle: 'القائد الملهم',
        },
        {
          achievementId: 'first_trophy',
          name: 'أول كأس',
          description: 'اربح بطولة',
          icon: '🏆',
          category: 'tournaments',
          requirement: 1,
          rewardCoins: 5000,
          rewardGems: 50,
          rewardTitle: 'بطل',
        },
        {
          achievementId: '5_trophies',
          name: 'صائد الألقاب',
          description: 'اربح 5 بطولات',
          icon: '🏅',
          category: 'tournaments',
          requirement: 5,
          rewardCoins: 15000,
          rewardGems: 150,
          rewardTitle: 'صائد الألقاب',
        },
        {
          achievementId: 'first_transfer',
          name: 'أول صفقة',
          description: 'اشترِ لاعباً من السوق',
          icon: '💰',
          category: 'transfers',
          requirement: 1,
          rewardCoins: 300,
          rewardGems: 3,
          rewardTitle: null,
        },
        {
          achievementId: '10_transfers',
          name: 'سمسار السوق',
          description: 'أكمل 10 صفقات',
          icon: '🤝',
          category: 'transfers',
          requirement: 10,
          rewardCoins: 2000,
          rewardGems: 20,
          rewardTitle: 'سمسار السوق',
        },
        {
          achievementId: 'first_training',
          name: 'مدرب مبتدئ',
          description: 'درب لاعباً لأول مرة',
          icon: '💪',
          category: 'training',
          requirement: 1,
          rewardCoins: 200,
          rewardGems: 2,
          rewardTitle: null,
        },
        {
          achievementId: '25_training',
          name: 'مدرب محترف',
          description: 'درب لاعبين 25 مرة',
          icon: '📋',
          category: 'training',
          requirement: 25,
          rewardCoins: 3000,
          rewardGems: 30,
          rewardTitle: 'مدرب محترف',
        },
        {
          achievementId: 'pack_opener',
          name: 'محظوظ',
          description: 'افتح حزمة لاعبين',
          icon: '🎰',
          category: 'special',
          requirement: 1,
          rewardCoins: 500,
          rewardGems: 5,
          rewardTitle: null,
        },
        {
          achievementId: 'legendary_pull',
          name: 'الاكتشاف الذهبي',
          description: 'احصل على لاعب بتقييم 90+ من حزمة',
          icon: '⭐',
          category: 'special',
          requirement: 1,
          rewardCoins: 5000,
          rewardGems: 50,
          rewardTitle: 'صائد النجوم',
        },
        {
          achievementId: 'rich_club',
          name: 'نادي الأثرياء',
          description: 'اجمع 100,000 عملة',
          icon: '🤑',
          category: 'special',
          requirement: 100000,
          rewardCoins: 0,
          rewardGems: 100,
          rewardTitle: 'نادي الأثرياء',
        },
      ],
    })
    console.log('✅ تم إنشاء 12 إنجاز')
  }

  // 4. Create first season
  const existingSeasons = await prisma.season.count()
  if (existingSeasons === 0) {
    console.log('📅 إنشاء الموسم الأول...')
    const now = new Date()
    const seasonEnd = new Date(now)
    seasonEnd.setDate(seasonEnd.getDate() + 30) // 30-day season

    await prisma.season.create({
      data: {
        number: 1,
        name: 'الموسم الافتتاحي',
        startDate: now,
        endDate: seasonEnd,
        status: 'active',
      },
    })
    console.log('✅ تم إنشاء الموسم الأول')
  }

  // 5. Create a welcome game event
  const existingEvents = await prisma.gameEvent.count()
  if (existingEvents === 0) {
    console.log('📰 إنشاء حدث ترحيبي...')
    const now = new Date()
    const eventEnd = new Date(now)
    eventEnd.setDate(eventEnd.getDate() + 7)

    await prisma.gameEvent.create({
      data: {
        type: 'double_rewards',
        title: '🎉 أسبوع المكافآت المضاعفة!',
        description: 'احصل على ضعف المكافآت اليومية لمدة أسبوع بمناسبة إطلاق اللعبة!',
        startDate: now,
        endDate: eventEnd,
        isActive: true,
      },
    })
    console.log('✅ تم إنشاء حدث ترحيبي')
  }

  console.log('\n✨ تمت تهيئة قاعدة البيانات بنجاح!')
}

main()
  .catch((e) => {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

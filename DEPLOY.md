# ⚽ Football Manager Game - دليل النشر المجاني

## 🚀 النشر على Vercel + Supabase (مجاني 100%)

### الخطوة 1: إنشاء حساب Supabase (قاعدة البيانات)

1. اذهب إلى [supabase.com](https://supabase.com) وسجّل حساب مجاني
2. أنشئ مشروع جديد (New Project)
3. اختر اسم المشروع وكلمة مرور قوية
4. اختر المنطقة الأقرب لك
5. انتظر حتى يتم إنشاء المشروع

### الخطوة 2: الحصول على روابط قاعدة البيانات

1. من لوحة تحكم Supabase، اذهب إلى **Settings → Database**
2. اسحب لأسفل إلى قسم **Connection string**
3. انسخ الروابط التالية:

**لـ DATABASE_URL (Connection Pooling):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**لـ DIRECT_URL (Direct Connection):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].supabase.com:5432/postgres
```

### الخطوة 3: إنشاء حساب Vercel والنشر

1. اذهب إلى [vercel.com](https://vercel.com) وسجّل حساب مجاني (يمكنك التسجيل بـ GitHub)
2. اضغط **"Add New → Project"**
3. اختر مستودع **"football-manager-game"** من GitHub
4. في صفحة الإعدادات:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && prisma db push && next build`
   - **Install Command**: `npm install`

### الخطوة 4: إضافة متغيرات البيئة في Vercel

في صفحة إعدادات المشروع على Vercel، اذهب إلى **Settings → Environment Variables** وأضف:

| المتغير | القيمة |
|---------|--------|
| `DATABASE_URL` | رابط Connection Pooling من Supabase (المنفذ 6543) |
| `DIRECT_URL` | رابط Direct Connection من Supabase (المنفذ 5432) |

### الخطوة 5: النشر!

1. اضغط **"Deploy"** في Vercel
2. انتظر حتى يكتمل البناء (3-5 دقائق)
3. سيتم تزويدك برابط اللعبة مثل: `football-manager-game.vercel.app`

### الخطوة 6: تهيئة البيانات الأولية

بعد النشر، شغّل أمر التهيئة لإنشاء البيانات الافتراضية:

```bash
# في Terminal محلي
npx prisma db seed
```

أو من خلال Vercel CLI:
```bash
vercel env pull .env.production
npx prisma db seed
```

---

## 💰 الحدود المجانية

| الخدمة | الحد المجاني | ما يعنيه |
|--------|-------------|----------|
| **Vercel** | 100GB نقل/شهر | يدعم ~100,000 زيارة/شهر |
| **Vercel** | Serverless Functions بلاحدود | كل API route يعمل تلقائياً |
| **Supabase** | 500MB تخزين | يدعم آلاف المستخدمين واللاعبين |
| **Supabase** | 5GB نقل/شهر | كافي للبداية |

---

## 🔧 نصائح مهمة

1. **أول مستخدم يسجّل** → اجعله مسؤولاً عبر Supabase Dashboard:
   - اذهب إلى Table Editor → users
   - ابحث عن المستخدم
   - غيّر `isAdmin` إلى `true`

2. **النسخ الاحتياطي** → Supabase يأخذ نسخ احتياطية يومية تلقائياً

3. **مراقبة الأداء** → من Vercel Dashboard يمكنك مراقبة الاستخدام والأخطاء

4. **نطاق مخصص** → يمكنك ربط نطاقك الخاص مجاناً في Vercel

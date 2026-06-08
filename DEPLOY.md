# ⚽ نادي الاسطورة - Legend Club | دليل النشر الشامل

## 🚀 النشر على Vercel + Supabase (مجاني 100%)

### الخطوة 1: إنشاء قاعدة البيانات على Supabase

1. اذهب إلى [supabase.com](https://supabase.com) وسجّل حساب مجاني
2. أنشئ مشروع جديد (New Project)
3. اختر اسم المشروع وكلمة مرور قوية
4. اختر المنطقة الأقرب لك
5. انتظر حتى يتم إنشاء المشروع

### الخطوة 2: إنشاء الجداول باستخدام SQL Editor

1. من لوحة تحكم Supabase، اذهب إلى **SQL Editor**
2. اضغط **New Query**
3. انسخ محتوى ملف `supabase-init.sql` بالكامل والصقه
4. اضغط **Run** لتنفيذ الاستعلام
5. ستُنشأ جميع الجداول والبيانات الأولية تلقائياً

### الخطوة 3: الحصول على روابط قاعدة البيانات

1. من لوحة تحكم Supabase، اذهب إلى **Settings → Database**
2. اسحب لأسفل إلى قسم **Connection string**
3. انسخ الروابط التالية:

**لـ DATABASE_URL (Connection Pooling):**
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**لـ DIRECT_URL (Direct Connection):**
```
postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
```

### الخطوة 4: إنشاء حساب Vercel والنشر

1. اذهب إلى [vercel.com](https://vercel.com) وسجّل حساب مجاني (يمكنك التسجيل بـ GitHub)
2. اضغط **"Add New → Project"**
3. اختر مستودع **"football-manager-game"** من GitHub
4. في صفحة الإعدادات:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && prisma db push && next build`
   - **Install Command**: `npm install`

### الخطوة 5: إضافة متغيرات البيئة في Vercel

في صفحة إعدادات المشروع على Vercel، اذهب إلى **Settings → Environment Variables** وأضف:

| المتغير | القيمة |
|---------|--------|
| `DATABASE_URL` | رابط Connection Pooling من Supabase (المنفذ 6543) |
| `DIRECT_URL` | رابط Direct Connection من Supabase (المنفذ 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[project-ref].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | مفتاح anon العام من Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | مفتاح service_role من Supabase |

### الخطوة 6: النشر!

1. اضغط **"Deploy"** في Vercel
2. انتظر حتى يكتمل البناء (3-5 دقائق)
3. سيتم تزويدك برابط اللعبة مثل: `football-manager-game.vercel.app`

---

## 📱 بناء تطبيق Android (APK)

### المتطلبات الأساسية

- **Android Studio** مثبت على جهازك
- **Android SDK** (API 33 أو أحدث)
- **Java JDK 17+**
- **Node.js 18+**

### الطريقة 1: استخدام Capacitor (موصى بها)

بعد نشر اللعبة على Vercel:

1. **تحديث رابط الخادم** في ملف `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'https://your-app.vercel.app',  // رابط Vercel الخاص بك
     androidScheme: 'https'
   }
   ```

2. **بناء الـ APK**:
   ```bash
   # تثبيت المكتبات
   npm install

   # إضافة منصة الأندرويد (أول مرة فقط)
   npx cap add android

   # مزامنة الملفات
   npx cap sync android

   # بناء الـ APK
   cd android
   ./gradlew assembleDebug
   ```

3. **العثور على ملف APK**:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

### الطريقة 2: استخدام Bubblewrap (TWA)

```bash
# تثبيت Bubblewrap
npm install -g @aspect/aspect-cli @nicolo-ribaudo/chokidar-2
npm install -g @nicolo-ribaudo/chokidar-2
npm install -g @nicolo-ribaudo/chokidar-2
npm install -g @nicolo-ribaudo/chokidar-2
npm install -g @nicolo-ribaudo/chokidar-2

# تثبيت Bubblewrap
npm install -g @nicolo-ribaudo/chokidar-2

# استخدام Bubblewrap
npx @nicolo-ribaudo/chokidar-2
npx @nicolo-ribaudo/chokidar-2

# تثبيت Bubblewrap بشكل صحيح
npm install -g @nicolo-ribaudo/chokidar-2

# إنشاء مشروع TWA
npx @nicolo-ribaudo/chokidar-2
```

بدلاً من ذلك، يمكنك استخدام أداة [pwabuilder.com](https://pwabuilder.com):
1. اذهب إلى الموقع
2. أدخل رابط Vercel الخاص باللعبة
3. اختر Android
4. حمّل ملف APK المُنشأ

### بناء نسخة الإصدار (Release APK)

1. **إنشاء ملف توقيع**:
   ```bash
   keytool -genkey -v -keystore legend-club.keystore -alias legend-club -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **إضافة إعدادات التوقيع** في `android/app/build.gradle`:
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file('../../legend-club.keystore')
               storePassword 'your-password'
               keyAlias 'legend-club'
               keyPassword 'your-password'
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **بناء Release APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
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

5. **إيقاف المشروع** → Supabase يوقف المشروع تلقائياً بعد أسبوع من عدم النشاط في الخطة المجانية، يمكنك إعادة تشغيله من لوحة التحكم

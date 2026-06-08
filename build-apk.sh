#!/bin/bash
# ============================================
# ⚽ نادي الاسطورة - APK Build Script
# ============================================
# This script builds the Android APK for the game
# Prerequisites:
#   1. Android Studio installed
#   2. Android SDK (API 33+)
#   3. Java JDK 17+
#   4. Node.js 18+
# ============================================

set -e

echo "============================================"
echo "⚽ نادي الاسطورة - بناء تطبيق الأندرويد"
echo "============================================"

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
  echo "⚠️  ANDROID_HOME not set. Setting to default..."
  export ANDROID_HOME=$HOME/Android/Sdk
  if [ ! -d "$ANDROID_HOME" ]; then
    export ANDROID_HOME=$HOME/Library/Android/sdk
  fi
fi

echo "📱 ANDROID_HOME: $ANDROID_HOME"

# Step 1: Install dependencies
echo ""
echo "📦 الخطوة 1: تثبيت المكتبات..."
npm install

# Step 2: Generate Prisma client
echo ""
echo "🗄️ الخطوة 2: إنشاء Prisma Client..."
npx prisma generate

# Step 3: Build Next.js (static export for APK)
echo ""
echo "🔨 الخطوة 3: بناء تطبيق الويب..."
# Temporarily set output to export for static build
export NEXT_BUILD_MODE=export
npm run build:static

# Step 4: Add Android platform if not exists
echo ""
echo "📱 الخطوة 4: إعداد منصة الأندرويد..."
if [ ! -d "android" ]; then
  npx cap add android
  echo "✅ تم إنشاء منصة الأندرويد"
else
  echo "ℹ️  منصة الأندرويد موجودة بالفعل"
fi

# Step 5: Sync web assets to Android
echo ""
echo "📋 الخطوة 5: مزامنة الملفات..."
npx cap sync android

# Step 6: Update Android app resources
echo ""
echo "🎨 الخطوة 6: تحديث موارد التطبيق..."

# Update app name in strings.xml
STRINGS_FILE="android/app/src/main/res/values/strings.xml"
if [ -f "$STRINGS_FILE" ]; then
  cat > "$STRINGS_FILE" << 'EOF'
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">نادي الاسطورة</string>
    <string name="title_activity_main">نادي الاسطورة</string>
    <string name="package_name">com.legendclub.game</string>
    <string name="custom_url_scheme">com.legendclub.game</string>
</resources>
EOF
  echo "✅ تم تحديث اسم التطبيق"
fi

# Create Arabic strings
mkdir -p android/app/src/main/res/values-ar
STRINGS_AR_FILE="android/app/src/main/res/values-ar/strings.xml"
if [ -f "$STRINGS_AR_FILE" ]; then
  cat > "$STRINGS_AR_FILE" << 'EOF'
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">نادي الاسطورة</string>
    <string name="title_activity_main">نادي الاسطورة</string>
</resources>
EOF
  echo "✅ تم تحديث الاسم العربي"
fi

# Step 7: Build APK
echo ""
echo "🔨 الخطوة 7: بناء ملف APK..."
cd android

# Build debug APK
./gradlew assembleDebug

echo ""
echo "============================================"
echo "✅ تم بناء APK بنجاح!"
echo "📂 الملف موجود في: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "💡 لبناء نسخة الإصدار (Release):"
echo "   cd android && ./gradlew assembleRelease"
echo "============================================"

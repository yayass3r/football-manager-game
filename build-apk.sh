#!/bin/bash
# ============================================
# ⚽ نادي الاسطورة - APK Build Script
# ============================================
# This script builds the APK for Android

set -e

echo "============================================"
echo "⚽ نادي الاسطورة - بناء تطبيق الأندرويد"
echo "============================================"

# Step 1: Build Next.js static export
echo ""
echo "📦 الخطوة 1: بناء تطبيق الويب..."
npm run build:static

# Step 2: Add Android platform if not exists
echo ""
echo "📱 الخطوة 2: إعداد منصة الأندرويد..."
if [ ! -d "android" ]; then
  npx cap add android
fi

# Step 3: Copy web assets to Android
echo ""
echo "📋 الخطوة 3: نسخ الملفات إلى الأندرويد..."
npx cap copy android

# Step 4: Sync
echo ""
echo "🔄 الخطوة 4: مزامنة الملفات..."
npx cap sync android

# Step 5: Build APK
echo ""
echo "🔨 الخطوة 5: بناء ملف APK..."
cd android
./gradlew assembleDebug

echo ""
echo "============================================"
echo "✅ تم بناء APK بنجاح!"
echo "📂 الملف موجود في: android/app/build/outputs/apk/debug/app-debug.apk"
echo "============================================"

#!/bin/bash
# ============================================
# ⚽ نادي الاسطورة - سكريبت النشر الكامل
# ============================================
# This script deploys the game to Vercel + Supabase
# Prerequisites:
#   - Node.js 18+
#   - Vercel CLI: npm i -g vercel
#   - Supabase CLI: npm i -g supabase
# ============================================

set -e

echo "============================================"
echo "⚽ نادي الاسطورة - نشر اللعبة"
echo "============================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Step 1: Install dependencies
echo ""
echo -e "${YELLOW}📦 الخطوة 1: تثبيت المكتبات...${NC}"
npm install

# Step 2: Generate Prisma Client
echo ""
echo -e "${YELLOW}🗄️ الخطوة 2: إنشاء Prisma Client...${NC}"
npx prisma generate

# Step 3: Push database schema to Supabase
echo ""
echo -e "${YELLOW}📊 الخطوة 3: إنشاء جداول قاعدة البيانات...${NC}"
echo ""
echo -e "${RED}⚠️  مهم: تأكد من أن ملف .env يحتوي على بيانات الاتصال الصحيحة${NC}"
echo -e "${YELLOW}   احصل على بيانات الاتصال من:${NC}"
echo "   https://supabase.com/dashboard/project/bzvvxdmbswtdvdrzjyay/settings/database"
echo ""

# Try to push schema
if npx prisma db push 2>/dev/null; then
  echo -e "${GREEN}✅ تم إنشاء الجداول بنجاح!${NC}"
else
  echo -e "${YELLOW}⚠️  لم يتم الاتصال بقاعدة البيانات تلقائياً${NC}"
  echo -e "${YELLOW}   يرجى تنفيذ ملف supabase-init.sql يدوياً:${NC}"
  echo "   1. اذهب إلى: https://supabase.com/dashboard/project/bzvvxdmbswtdvdrzjyay/sql"
  echo "   2. اضغط New Query"
  echo "   3. انسخ محتوى supabase-init.sql والصقه"
  echo "   4. اضغط Run"
  echo ""
  read -p "هل قمت بتنفيذ SQL؟ (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ يرجى تنفيذ SQL أولاً ثم أعد تشغيل السكريبت${NC}"
    exit 1
  fi
fi

# Step 4: Build
echo ""
echo -e "${YELLOW}🔨 الخطوة 4: بناء التطبيق...${NC}"
npm run build

# Step 5: Deploy to Vercel
echo ""
echo -e "${YELLOW}🚀 الخطوة 5: النشر على Vercel...${NC}"
echo ""
echo -e "${YELLOW}   ستحتاج لتسجيل الدخول إلى Vercel إذا لم تكن مسجلاً${NC}"
echo ""

# Deploy to Vercel
vercel --prod

echo ""
echo -e "${GREEN}============================================"
echo "✅ تم النشر بنجاح!"
echo -e "============================================${NC}"
echo ""
echo "🔗 اللعبة متاحة على الرابط الذي عرضه Vercel"
echo ""
echo "📝 الخطوات التالية:"
echo "   1. افتح رابط اللعبة"
echo "   2. سجّل حساب جديد"
echo "   3. اجعل نفسك مسؤولاً من Supabase Dashboard"
echo "      (Table Editor → users → غيّر isAdmin إلى true)"
echo "   4. من لوحة المسؤول، تهّي البيانات الأولية"
echo ""

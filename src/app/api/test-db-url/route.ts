import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'DATABASE_URL is required' }, { status: 400 });
    }

    const client = new Client({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    try {
      await client.connect();
      const result = await client.query('SELECT current_database(), inet_server_addr(), inet_server_port(), version()');
      await client.end();
      
      return NextResponse.json({
        status: 'success',
        message: 'تم الاتصال بقاعدة البيانات بنجاح!',
        database: result.rows[0],
      });
    } catch (dbError: any) {
      return NextResponse.json({
        status: 'error',
        message: 'فشل الاتصال بقاعدة البيانات',
        error: dbError.message,
        hint: 'تأكد من أن رابط الاتصال صحيح. راجع إعدادات قاعدة البيانات في Supabase Dashboard.',
      }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'خطأ في الطلب',
      error: error.message,
    }, { status: 500 });
  }
}

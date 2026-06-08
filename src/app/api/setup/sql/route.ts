import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const sqlPath = path.join(process.cwd(), 'supabase-init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    return new NextResponse(sql, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="supabase-init.sql"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to read SQL file',
      message: error.message,
    }, { status: 500 });
  }
}

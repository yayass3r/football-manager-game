import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const regions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1', 'eu-central-2', 'eu-north-1',
    'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ap-northeast-2', 
    'ap-south-1', 'ap-east-1', 'sa-east-1', 'ca-central-1'
  ];
  
  const results: Record<string, string> = {};
  const password = '@1412Yasser@';
  
  for (const region of regions) {
    const client = new Client({
      host: `aws-0-${region}.pooler.supabase.com`,
      port: 6543,
      database: 'postgres',
      user: 'postgres.bzvvxdmbswtdvdrzjyay',
      password: password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000
    });
    
    try {
      await client.connect();
      const res = await client.query('SELECT current_database()');
      await client.end();
      results[region] = `SUCCESS: ${JSON.stringify(res.rows[0])}`;
    } catch (e: any) {
      results[region] = `FAILED: ${e.message.substring(0, 100)}`;
    }
  }
  
  // Also try direct connection
  const directClient = new Client({
    host: 'db.bzvvxdmbswtdvdrzjyay.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  
  try {
    await directClient.connect();
    const res = await directClient.query('SELECT current_database()');
    await directClient.end();
    results['direct'] = `SUCCESS: ${JSON.stringify(res.rows[0])}`;
  } catch (e: any) {
    results['direct'] = `FAILED: ${e.message.substring(0, 100)}`;
  }
  
  return NextResponse.json({ results });
}

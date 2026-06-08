const NEXT_AUTH_SECRET = process.env.NEXTAUTH_SECRET || 'legend-club-game-secret-key-2024'

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bzvvxdmbswtdvdrzjyay.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dnZ4ZG1ic3d0ZHZkcnpqeWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDU4NDUsImV4cCI6MjA5NjQ4MTg0NX0.i7mA_W162Sdg5CfmKZ2h0cdhOSTjhnnjaVq_DLHn_IM',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dnZ4ZG1ic3d0ZHZkcnpqeWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkwNTg0NSwiZXhwIjoyMDk2NDgxODQ1fQ.etKa2JQ4iopCnoXiEalShcLmJKAcNOsB4bsSJJ-V7b8',
  projectRef: 'bzvvxdmbswtdvdrzjyay',
}

// Game Configuration
export const GAME_CONFIG = {
  name: 'نادي الاسطورة',
  nameEn: 'Legend Club',
  version: '1.0.0',
  defaultCoins: 5000,
  defaultGems: 50,
  trainingCost: 500,
  transferCommission: 0.10,
  maxPlayers: 22,
  adReward: { coins: 200, gems: 5 },
}

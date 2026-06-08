# Task 1 - Backend API Routes for Football Manager Game

## Agent: Backend API Developer
## Date: 2026-06-08

## Summary
Built all backend API routes for the online football manager game (Arabic RTL) using Next.js 16 App Router, TypeScript, and Prisma ORM (SQLite).

## Files Created

### Utility Libraries
- `/src/lib/auth.ts` - Password hashing utilities (bcryptjs)
- `/src/lib/player-generator.ts` - Player generation with position-based stats, Arabic/international names
- `/src/lib/match-simulation.ts` - Match simulation engine with probabilistic model, formation bonuses, event generation
- `/src/lib/daily-rewards.ts` - Daily reward logic with 7-day streak system

### Auth & User APIs
- `/src/app/api/auth/register/route.ts` - POST: Register user (5000 coins, 50 gems)
- `/src/app/api/auth/login/route.ts` - POST: Login with credentials
- `/src/app/api/user/profile/route.ts` - GET: User profile with club info
- `/src/app/api/user/update-avatar/route.ts` - POST: Update avatar emoji

### Club APIs
- `/src/app/api/club/create/route.ts` - POST: Create club + 22 auto-generated players
- `/src/app/api/club/route.ts` - GET: Club details with all players
- `/src/app/api/club/update/route.ts` - PUT: Update club properties
- `/src/app/api/club/formation/route.ts` - PUT: Update formation/tactics

### Player APIs
- `/src/app/api/players/route.ts` - GET: All players for user's club
- `/src/app/api/players/[id]/toggle-starter/route.ts` - PUT: Toggle starter/bench (max 11 starters)
- `/src/app/api/players/[id]/train/route.ts` - POST: Train player (500 coins, position-based stat improvement)

### Transfer Market APIs
- `/src/app/api/transfer-market/route.ts` - GET: Active transfer listings with player details
- `/src/app/api/transfer-market/sell/route.ts` - POST: List player for sale
- `/src/app/api/transfer-market/buy/route.ts` - POST: Buy player (10% commission)
- `/src/app/api/transfer-market/[id]/route.ts` - DELETE: Cancel listing

### Match APIs
- `/src/app/api/match/simulate/route.ts` - POST: Simulate match between two clubs
- `/src/app/api/match/history/route.ts` - GET: Match history for user's club

### Tournament APIs
- `/src/app/api/tournaments/route.ts` - GET: Available tournaments with participant counts
- `/src/app/api/tournaments/[id]/join/route.ts` - POST: Join tournament
- `/src/app/api/tournaments/[id]/simulate-round/route.ts` - POST: Simulate next round
- `/src/app/api/tournaments/[id]/standings/route.ts` - GET: Tournament standings
- `/src/app/api/tournaments/seed/route.ts` - POST: Seed 4 default tournaments

### Economy APIs
- `/src/app/api/economy/daily-reward/route.ts` - GET/POST: Claim daily login rewards
- `/src/app/api/economy/watch-ad/route.ts` - POST: Watch ad for bonus (200 coins, 5 gems)

## Schema Changes
- Added `@@unique([tournamentId, clubId])` to TournamentParticipant
- Added `TransferListing.player` relation (Player → TransferListing[])
- Added `TransferListing.sellerClub` relation (Club → TransferListing[])
- Disabled Prisma query logging in db.ts for cleaner output

## Key Design Decisions
1. **Authentication**: Simple header-based (`x-user-id`) auth. No JWT/sessions in this phase.
2. **Player Generation**: 22 players with position-accurate distribution (2 GK, 5 CB, 2 LB, 2 RB, 3 CM, 2 LM, 2 RM, 2 ST, 2 CF). Stats 55-85 range. Arabic and international names.
3. **Match Simulation**: Probabilistic model with formation bonuses, morale factors, fitness tracking. Events include goals, cards, injuries, substitutions.
4. **Daily Rewards**: Encoded as `(daysSince2024 * 100) + streakDay` in the xp field to fit in SQLite INT.
5. **Error Messages**: Arabic error messages for all user-facing errors.
6. **Consistent Response Format**: `{ success: boolean, data?: any, error?: string }`

## Lint Status
✅ All files pass ESLint

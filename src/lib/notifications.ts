/**
 * Android Notification Bridge
 * Sends notifications through the native Android app when available,
 * falls back to browser notifications or in-app toast.
 */

export type NotificationType = 
  | 'match_result'
  | 'training_complete'
  | 'daily_reward'
  | 'transfer_update'
  | 'tournament_update'
  | 'pack_ready'
  | 'energy_full'

interface AndroidBridge {
  showMatchResult(opponent: string, myScore: number, oppScore: number): void
  showTrainingComplete(playerName: string): void
  showDailyReward(): void
  showTransferUpdate(playerName: string, action: string): void
  showTournamentUpdate(tournamentName: string): void
  showPackReady(packType: string): void
  showEnergyFull(): void
  cancelAllNotifications(): void
}

declare global {
  interface Window {
    Android?: AndroidBridge
  }
}

export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && !!window.Android
}

export function notifyMatchResult(opponent: string, myScore: number, oppScore: number) {
  if (window.Android) {
    window.Android.showMatchResult(opponent, myScore, oppScore)
  } else if ('Notification' in window && Notification.permission === 'granted') {
    const result = myScore > oppScore ? 'فزت!' : myScore < oppScore ? 'خسرت' : 'تعادل'
    new Notification('نتيجة المباراة', {
      body: `${result} ضد ${opponent} (${myScore}-${oppScore})`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'match-result',
    })
  }
}

export function notifyTrainingComplete(playerName: string) {
  if (window.Android) {
    window.Android.showTrainingComplete(playerName)
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('اكتمال التدريب', {
      body: `انتهى تدريب ${playerName}`,
      icon: '/icon-192.png',
      tag: 'training',
    })
  }
}

export function notifyDailyReward() {
  if (window.Android) {
    window.Android.showDailyReward()
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('المكافأة اليومية', {
      body: 'مكافأتك اليومية جاهزة! اضغط لاستلامها',
      icon: '/icon-192.png',
      tag: 'daily-reward',
    })
  }
}

export function notifyTransferUpdate(playerName: string, action: string) {
  if (window.Android) {
    window.Android.showTransferUpdate(playerName, action)
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('سوق الانتقالات', {
      body: `${action} ${playerName} بنجاح`,
      icon: '/icon-192.png',
      tag: 'transfer',
    })
  }
}

export function notifyTournamentUpdate(tournamentName: string) {
  if (window.Android) {
    window.Android.showTournamentUpdate(tournamentName)
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('البطولة', {
      body: `تحديث في بطولة ${tournamentName}`,
      icon: '/icon-192.png',
      tag: 'tournament',
    })
  }
}

export function notifyPackReady(packType: string) {
  if (window.Android) {
    window.Android.showPackReady(packType)
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('بكج جديد!', {
      body: `بكج ${packType} جاهز للفتح!`,
      icon: '/icon-192.png',
      tag: 'pack-ready',
    })
  }
}

export function notifyEnergyFull() {
  if (window.Android) {
    window.Android.showEnergyFull()
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('الطاقة ممتلئة!', {
      body: 'طاقتك اكتملت! العب الآن',
      icon: '/icon-192.png',
      tag: 'energy',
    })
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  // In native app, permissions are handled by the app
  if (isNativeApp()) return true

  // In browser, request permission
  if ('Notification' in window) {
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }
  return false
}

// Schedule a local notification after a delay (for training, energy refill, etc.)
export function scheduleNotification(
  type: NotificationType,
  data: Record<string, any>,
  delayMs: number
) {
  setTimeout(() => {
    switch (type) {
      case 'match_result':
        notifyMatchResult(data.opponent, data.myScore, data.oppScore)
        break
      case 'training_complete':
        notifyTrainingComplete(data.playerName)
        break
      case 'daily_reward':
        notifyDailyReward()
        break
      case 'transfer_update':
        notifyTransferUpdate(data.playerName, data.action)
        break
      case 'tournament_update':
        notifyTournamentUpdate(data.tournamentName)
        break
      case 'pack_ready':
        notifyPackReady(data.packType)
        break
      case 'energy_full':
        notifyEnergyFull()
        break
    }
  }, delayMs)
}

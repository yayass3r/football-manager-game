export interface SoundVisual {
  emoji: string
  animation: 'bounce' | 'pulse' | 'wave' | 'flip' | 'confetti' | 'shake' | 'glow'
  duration: number // ms
  color: string
}

export function playGoalSound(): SoundVisual {
  return { emoji: '⚽', animation: 'bounce', duration: 1500, color: '#10b981' }
}

export function playWhistleSound(): SoundVisual {
  return { emoji: '🔊', animation: 'pulse', duration: 1000, color: '#f59e0b' }
}

export function playCrowdSound(): SoundVisual {
  return { emoji: '👏', animation: 'wave', duration: 1200, color: '#8b5cf6' }
}

export function playCardSound(): SoundVisual {
  return { emoji: '🟨', animation: 'flip', duration: 800, color: '#eab308' }
}

export function playVictorySound(): SoundVisual {
  return { emoji: '🎉', animation: 'confetti', duration: 2000, color: '#f43f5e' }
}

export function playPackOpenSound(): SoundVisual {
  return { emoji: '🎰', animation: 'shake', duration: 1500, color: '#a855f7' }
}

export function playAchievementSound(): SoundVisual {
  return { emoji: '🏅', animation: 'glow', duration: 1500, color: '#f59e0b' }
}

export function playCoinsSound(): SoundVisual {
  return { emoji: '🪙', animation: 'bounce', duration: 1000, color: '#eab308' }
}

// Animation CSS class mappings
export function getAnimationClass(animation: SoundVisual['animation']): string {
  switch (animation) {
    case 'bounce':
      return 'animate-bounce'
    case 'pulse':
      return 'animate-pulse'
    case 'wave':
      return 'animate-pulse'
    case 'flip':
      return '[animation:flip_0.8s_ease-in-out]'
    case 'confetti':
      return 'animate-bounce'
    case 'shake':
      return '[animation:shake_0.5s_ease-in-out_3]'
    case 'glow':
      return 'animate-pulse'
    default:
      return ''
  }
}

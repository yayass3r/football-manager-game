'use client'

import { useState } from 'react'
import { useGameStore } from '@/lib/game-store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const KIT_STYLES = [
  { id: 'classic', label: 'كلاسيكي', pattern: 'solid' },
  { id: 'striped', label: 'مقلم', pattern: 'vertical-stripes' },
  { id: 'horizontal', label: 'أفقي', pattern: 'horizontal-stripes' },
  { id: 'gradient', label: 'متدرج', pattern: 'gradient' },
  { id: 'retro', label: 'ريترو', pattern: 'retro' },
  { id: 'neon', label: 'نيون', pattern: 'neon' },
]

const KIT_PATTERNS = [
  { id: 'plain', label: 'عادي' },
  { id: 'horizontal', label: 'أفقي' },
  { id: 'vertical', label: 'عمودي' },
  { id: 'diagonal', label: 'مائل' },
  { id: 'checker', label: 'رقعة' },
]

function KitPreview({ primaryColor, secondaryColor, kitStyle, kitPattern }: {
  primaryColor: string
  secondaryColor: string
  kitStyle: string
  kitPattern: string
}) {
  const getStyleBackground = (): React.CSSProperties => {
    const base: React.CSSProperties = {}

    switch (kitStyle) {
      case 'classic':
        base.background = primaryColor
        break
      case 'striped':
        base.background = `repeating-linear-gradient(90deg, ${primaryColor}, ${primaryColor} 8px, ${secondaryColor} 8px, ${secondaryColor} 16px)`
        break
      case 'horizontal':
        base.background = `repeating-linear-gradient(0deg, ${primaryColor}, ${primaryColor} 10px, ${secondaryColor} 10px, ${secondaryColor} 20px)`
        break
      case 'gradient':
        base.background = `linear-gradient(180deg, ${primaryColor}, ${secondaryColor})`
        break
      case 'retro':
        base.background = `linear-gradient(135deg, ${primaryColor} 25%, ${secondaryColor} 25%, ${secondaryColor} 50%, ${primaryColor} 50%, ${primaryColor} 75%, ${secondaryColor} 75%)`
        base.backgroundSize = '20px 20px'
        break
      case 'neon':
        base.background = primaryColor
        base.boxShadow = `0 0 15px ${primaryColor}80, inset 0 0 15px ${secondaryColor}40`
        break
      default:
        base.background = primaryColor
    }

    return base
  }

  const getPatternOverlay = (): React.CSSProperties => {
    switch (kitPattern) {
      case 'horizontal':
        return { background: `repeating-linear-gradient(0deg, transparent, transparent 6px, ${secondaryColor}20 6px, ${secondaryColor}20 8px)` }
      case 'vertical':
        return { background: `repeating-linear-gradient(90deg, transparent, transparent 6px, ${secondaryColor}20 6px, ${secondaryColor}20 8px)` }
      case 'diagonal':
        return { background: `repeating-linear-gradient(45deg, transparent, transparent 6px, ${secondaryColor}20 6px, ${secondaryColor}20 8px)` }
      case 'checker':
        return { background: `linear-gradient(45deg, ${secondaryColor}15 25%, transparent 25%, transparent 75%, ${secondaryColor}15 75%, ${secondaryColor}15), linear-gradient(45deg, ${secondaryColor}15 25%, transparent 25%, transparent 75%, ${secondaryColor}15 75%, ${secondaryColor}15)`, backgroundSize: '12px 12px', backgroundPosition: '0 0, 6px 6px' }
      default:
        return {}
    }
  }

  return (
    <div className="relative flex justify-center">
      {/* T-shirt Shape */}
      <svg viewBox="0 0 200 220" className="w-40 h-44">
        <defs>
          <clipPath id="tshirt-clip">
            <path d="M40,0 L0,40 L30,60 L30,200 L170,200 L170,60 L200,40 L160,0 L130,25 C120,35 80,35 70,25 Z" />
          </clipPath>
        </defs>
        {/* Main shirt body with style */}
        <g clipPath="url(#tshirt-clip)">
          <rect x="0" y="0" width="200" height="220" style={getStyleBackground()} />
          {/* Pattern overlay */}
          <rect x="0" y="0" width="200" height="220" style={getPatternOverlay()} />
          {/* Collar */}
          <ellipse cx="100" cy="20" rx="30" ry="12" fill={secondaryColor} opacity="0.5" />
          {/* Sleeve accent */}
          <path d="M0,40 L30,60 L30,90 L0,70 Z" fill={secondaryColor} opacity="0.3" />
          <path d="M200,40 L170,60 L170,90 L200,70 Z" fill={secondaryColor} opacity="0.3" />
        </g>
        {/* Outline */}
        <path d="M40,0 L0,40 L30,60 L30,200 L170,200 L170,60 L200,40 L160,0 L130,25 C120,35 80,35 70,25 Z" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      </svg>
    </div>
  )
}

export default function KitCustomizer() {
  const { club, updateKit, isLoading } = useGameStore()
  const [open, setOpen] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState(club?.kitStyle || 'classic')
  const [selectedPattern, setSelectedPattern] = useState(club?.kitPattern || 'plain')

  if (!club) return null

  const handleSave = async () => {
    await updateKit(selectedStyle, selectedPattern)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white/50 hover:text-white hover:bg-white/5 text-xs h-8"
        >
          👕 الأطقم
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#0d1f35] border-white/10 max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-center">تخصيص الطقم</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Preview */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <KitPreview
              primaryColor={club.primaryColor}
              secondaryColor={club.secondaryColor}
              kitStyle={selectedStyle}
              kitPattern={selectedPattern}
            />
          </div>

          {/* Kit Style Selection */}
          <div>
            <h4 className="text-white/60 text-xs font-bold mb-2">نمط الطقم</h4>
            <div className="grid grid-cols-3 gap-2">
              {KIT_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedStyle === style.id
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="w-8 h-8 mx-auto mb-1 rounded-md overflow-hidden">
                    <KitPreview
                      primaryColor={club.primaryColor}
                      secondaryColor={club.secondaryColor}
                      kitStyle={style.id}
                      kitPattern={selectedPattern}
                    />
                  </div>
                  <span className="text-white/60 text-[9px]">{style.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pattern Selection */}
          <div>
            <h4 className="text-white/60 text-xs font-bold mb-2">النقش</h4>
            <div className="flex gap-2 flex-wrap">
              {KIT_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedPattern(pattern.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    selectedPattern === pattern.id
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'bg-white/5 text-white/40 hover:text-white/60 border border-white/10'
                  }`}
                >
                  {pattern.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
          >
            حفظ 👕
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

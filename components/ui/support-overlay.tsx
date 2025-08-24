'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, SkipForward } from 'lucide-react'

interface SupportOverlayProps {
  isVisible: boolean
  onClose: () => void
  supportersCount?: number
}

const motivationalMessages = [
  "🎉 You just created an amazing GIF! Want to support this tool?",
  "🚀 That was fast! Help us keep building amazing tools",
  "✨ Your GIF is ready! Consider supporting independent developers",
  "💪 You've got the power! Help us keep building awesome tools",
  "🌟 That conversion was smooth! Want to support our work?"
]

const rotatingSublines = [
  "No ads, no trackers — just pure creativity",
  "Keeps this free & fast for everyone",
  "Support independent developers like us",
  "Every coffee helps keep the servers running"
]

export function SupportOverlay({ isVisible, onClose, supportersCount }: SupportOverlayProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [currentSubline, setCurrentSubline] = useState(0)

  useEffect(() => {
    if (isVisible) {
      // Rotate messages every 4 seconds
      const messageInterval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % motivationalMessages.length)
      }, 4000)

      // Rotate sublines every 3 seconds
      const sublineInterval = setInterval(() => {
        setCurrentSubline((prev) => (prev + 1) % rotatingSublines.length)
      }, 3000)

      return () => {
        clearInterval(messageInterval)
        clearInterval(sublineInterval)
      }
    }
  }, [isVisible])

  const trackTipClick = (provider: 'bmc' | 'paypal') => {
    if (typeof window !== 'undefined') {
      if (window.plausible) {
        window.plausible('tip_click', { 
          props: { provider, placement: 'roadblock' } 
        })
      } else {
        console.log('tip_click', { provider, placement: 'roadblock' })
      }
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black/95 to-gray-900/95 backdrop-blur-md">
      {/* Skip Button - Top Right */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/20 transition-all duration-300 hover:scale-105"
        title="Skip for now"
      >
        <SkipForward className="w-4 h-4" />
        <span className="text-sm font-medium">Skip</span>
      </button>

      {/* Main Content - Centered */}
      <div className="relative w-full max-w-2xl mx-8 text-center">
        {/* Content */}
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
              <span className="text-4xl">☕</span>
            </div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              {motivationalMessages[currentMessage]}
            </h2>
            <p className="text-xl text-gray-300 max-w-lg mx-auto">
              {rotatingSublines[currentSubline]}
            </p>
          </div>

          {/* Supporters Count */}
          {supportersCount && (
            <div className="bg-white/10 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20 max-w-md mx-auto">
              <p className="text-lg text-white">
                <span className="font-bold text-orange-300">{supportersCount}</span> people already support this tool
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4 max-w-md mx-auto">
            {/* Primary CTA - Buy Me a Coffee */}
            <Button
              onClick={() => {
                trackTipClick('bmc')
                window.open('https://www.buymeacoffee.com/joeallison?utm_source=app&utm_medium=roadblock&utm_campaign=post_download', '_blank')
              }}
              className="w-full bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white py-6 text-xl font-bold shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 rounded-2xl"
            >
              ☕ Buy me a coffee
            </Button>

            {/* Secondary CTA - PayPal */}
            <Button
              onClick={() => {
                trackTipClick('paypal')
                window.open('https://www.paypal.com/donate/?business=5NVA6Q7JXTHC4&amount=5&no_recurring=0&item_name=Supporting+an+independent+creator.+Your+donation+helps+keep+projects+alive+and+growing.+%E2%9D%A4%EF%B8%8F&currency_code=GBP', '_blank')
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-xl font-bold shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 rounded-2xl border-0"
            >
              💸 PayPal
            </Button>
          </div>

          {/* Enhanced Skip Option */}
          <div className="pt-4">
            <button
              onClick={onClose}
              className="text-lg text-gray-400 hover:text-white transition-colors duration-300 font-medium hover:underline"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>

      {/* Close Button - Alternative position */}
      <button
        onClick={onClose}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20"
        title="Close"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  )
}

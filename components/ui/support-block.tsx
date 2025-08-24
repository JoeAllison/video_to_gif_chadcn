'use client'

import { useState, useEffect } from 'react'

interface SupportBlockProps {
  placement: 'post_success' | 'footer'
  supportersCount?: number
}

const rotatingSublines = [
  'Keeps this free & fast — thanks! ❤️',
  'If this saved you time, say thanks with ☕',
  'No ads, no trackers — supported by you'
]

const primaryCTAVariants = [
  '☕ Buy me a coffee',
  '☕ Support this project'
]

export function SupportBlock({ placement, supportersCount }: SupportBlockProps) {
  const [currentSubline, setCurrentSubline] = useState(0)
  const [primaryCTA, setPrimaryCTA] = useState('☕ Buy me a coffee')

  useEffect(() => {
    // Rotate subline every 3 seconds
    const sublineInterval = setInterval(() => {
      setCurrentSubline((prev) => (prev + 1) % rotatingSublines.length)
    }, 3000)

    return () => clearInterval(sublineInterval)
  }, [])

  const trackTipClick = (provider: 'bmc' | 'paypal') => {
    // Analytics tracking
    if (typeof window !== 'undefined') {
      if (window.plausible) {
        window.plausible('tip_click', { 
          props: { provider, placement } 
        })
      } else {
        console.log('tip_click', { provider, placement })
      }
    }
  }

  return (
    <div className="text-center space-y-4 p-5">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">
          Enjoyed this tool?
        </h3>
        
                {/* Donation Buttons - Side by Side */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          {/* Primary CTA - Buy Me a Coffee */}
          <a
            href={`https://www.buymeacoffee.com/joeallison?utm_source=app&utm_medium=tipjar&utm_campaign=${placement}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackTipClick('bmc')}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
          >
            <span>{primaryCTA}</span>
          </a>

          {/* Secondary CTA - PayPal */}
          <a
            href="https://www.paypal.com/donate/?business=5NVA6Q7JXTHC4&amount=5&no_recurring=0&item_name=Supporting+an+independent+creator.+Your+donation+helps+keep+projects+alive+and+growing.+%E2%9D%A4%EF%B8%8F&currency_code=GBP"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackTipClick('paypal')}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md text-sm"
          >
            <span>💸 Donate via PayPal</span>
          </a>
        </div>

        {/* Rotating Subline */}
        <p className="text-sm text-muted-foreground italic">
          {rotatingSublines[currentSubline]}
        </p>

        {/* Supporters Count (if provided) */}
        {supportersCount && (
          <p className="text-xs text-muted-foreground">
            {supportersCount} supporters so far
          </p>
        )}
      </div>
      
      {/* Subtle stroke divider at the bottom */}
      <div className="pt-4">
        <div className="w-full h-px bg-border"></div>
      </div>
    </div>
  )
}

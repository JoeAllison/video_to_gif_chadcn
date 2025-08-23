interface TrackEventProps {
  [key: string]: string | number | boolean
}

export function track(event: string, props?: TrackEventProps) {
  if (typeof window !== 'undefined') {
    if (window.plausible) {
      window.plausible(event, { props })
    } else {
      console.log('Analytics Event:', event, props)
    }
  }
}

// Track conversion success
export function trackConversionSuccess() {
  track('conversion_success')
}

// Track tip clicks
export function trackTipClick(provider: 'bmc' | 'paypal', placement: 'post_success' | 'footer') {
  track('tip_click', { provider, placement })
}

// Track nudge shown
export function trackNudgeShown(placement: 'post_success' | 'footer') {
  track('nudge_shown', { placement })
}

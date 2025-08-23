import { showToast } from './toast'

export function nudgeSupportOncePerDay() {
  const today = new Date().toDateString()
  const lastNudgeKey = 'lastSupportNudge'
  const lastNudge = localStorage.getItem(lastNudgeKey)

  // Check if we've already nudged today
  if (lastNudge === today) {
    return
  }

  // Show the nudge toast
  showToast({
    message: 'Enjoyed this? Tip a coffee or use PayPal 🙏',
    actionText: 'Support',
    actionUrl: 'https://www.buymeacoffee.com/joeallison?utm_source=app&utm_medium=nudge&utm_campaign=post_success'
  })

  // Track the nudge event
  if (typeof window !== 'undefined') {
    if (window.plausible) {
      window.plausible('nudge_shown', { 
        props: { placement: 'post_success' } 
      })
    } else {
      console.log('nudge_shown', { placement: 'post_success' })
    }
  }

  // Mark today as nudged
  localStorage.setItem(lastNudgeKey, today)
}

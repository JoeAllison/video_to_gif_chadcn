interface ToastOptions {
  message: string
  actionText?: string
  actionUrl?: string
  duration?: number
}

export function showToast({ message, actionText, actionUrl, duration = 4000 }: ToastOptions) {
  // Remove existing toast if present
  const existingToast = document.getElementById('toast-notification')
  if (existingToast) {
    existingToast.remove()
  }

  // Create toast container
  const toast = document.createElement('div')
  toast.id = 'toast-notification'
  toast.className = `
    fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg 
    transform transition-all duration-300 ease-out translate-x-full
  `

  // Create toast content
  const content = document.createElement('div')
  content.className = 'p-4'
  
  // Message
  const messageEl = document.createElement('p')
  messageEl.className = 'text-sm text-gray-900 dark:text-gray-100 mb-3'
  messageEl.textContent = message
  content.appendChild(messageEl)

  // Action button (if provided)
  if (actionText && actionUrl) {
    const actionBtn = document.createElement('a')
    actionBtn.href = actionUrl
    actionBtn.target = '_blank'
    actionBtn.rel = 'noopener noreferrer'
    actionBtn.className = `
      inline-flex items-center px-3 py-1.5 text-xs font-medium 
      bg-orange-500 hover:bg-orange-600 text-white rounded-md 
      transition-colors duration-200
    `
    actionBtn.textContent = actionText
    content.appendChild(actionBtn)
  }

  // Close button
  const closeBtn = document.createElement('button')
  closeBtn.className = `
    absolute top-2 right-2 w-6 h-6 flex items-center justify-center
    text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
    transition-colors duration-200
  `
  closeBtn.innerHTML = '×'
  closeBtn.onclick = () => removeToast()
  content.appendChild(closeBtn)

  toast.appendChild(content)
  document.body.appendChild(toast)

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-full')
  })

  // Auto-dismiss
  const timeout = setTimeout(() => {
    removeToast()
  }, duration)

  function removeToast() {
    clearTimeout(timeout)
    toast.classList.add('translate-x-full')
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove()
      }
    }, 300)
  }

  // Return remove function for manual control
  return removeToast
}

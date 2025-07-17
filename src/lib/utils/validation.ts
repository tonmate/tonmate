/**
 * Validation utilities for the application
 */

/**
 * Validates if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Validates if a string is a valid email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Sanitizes HTML content by removing dangerous tags
 */
export function sanitizeHtml(html: string): string {
  // Remove script, style, and other dangerous tags
  const dangerousTags = /<(script|style|iframe|object|embed|form|input|textarea|button|select|option|link|meta|title|base|head)[^>]*>.*?<\/\1>/gi
  const voidDangerousTags = /<(script|style|iframe|object|embed|form|input|textarea|button|select|option|link|meta|title|base|head)[^>]*>/gi
  
  return html
    .replace(dangerousTags, '')
    .replace(voidDangerousTags, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength).trim() + '...'
}

/**
 * Validates if a string is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validates if a string is a valid agent name
 */
export function isValidAgentName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 50
}

/**
 * Validates if a string is a valid system prompt
 */
export function isValidSystemPrompt(prompt: string): boolean {
  return prompt.trim().length >= 10 && prompt.trim().length <= 2000
}

/**
 * Validates crawling options
 */
export function isValidCrawlOptions(options: {
  maxPages?: number
  maxDepth?: number
  generateEmbeddings?: boolean
}): boolean {
  const { maxPages = 10, maxDepth = 2 } = options
  
  return (
    maxPages >= 1 && 
    maxPages <= 100 &&
    maxDepth >= 1 && 
    maxDepth <= 5
  )
}

// Let's create some utility functions first, then test them
import { isValidUrl, isValidEmail, sanitizeHtml, truncateText } from '@/lib/utils/validation'

describe('validation utilities', () => {
  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('https://subdomain.example.com')).toBe(true)
      expect(isValidUrl('https://example.com/path?query=value')).toBe(true)
    })

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('ftp://example.com')).toBe(false)
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl('javascript:alert(1)')).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('sanitizeHtml', () => {
    it('should remove dangerous HTML tags', () => {
      const dangerousHtml = '<script>alert("xss")</script><p>Safe content</p>'
      const result = sanitizeHtml(dangerousHtml)
      
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert("xss")')
      expect(result).toContain('Safe content')
    })

    it('should preserve safe HTML tags', () => {
      const safeHtml = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em>'
      const result = sanitizeHtml(safeHtml)
      
      expect(result).toContain('<p>Paragraph</p>')
      expect(result).toContain('<strong>Bold</strong>')
      expect(result).toContain('<em>Italic</em>')
    })
  })

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated'
      const result = truncateText(longText, 20)
      
      expect(result).toBe('This is a very long...')
      expect(result.length).toBe(22) // actual length with ellipsis
    })

    it('should not truncate short text', () => {
      const shortText = 'Short text'
      const result = truncateText(shortText, 20)
      
      expect(result).toBe('Short text')
    })

    it('should handle empty text', () => {
      expect(truncateText('', 10)).toBe('')
    })
  })
})

import '@testing-library/jest-dom'

// Mock globals for Next.js environment
Object.defineProperty(global, 'Request', {
  value: class Request {
    constructor(url, options = {}) {
      this.url = url
      this.method = options.method || 'GET'
      this.headers = new Headers(options.headers || {})
      this.body = options.body || null
    }
    
    async json() {
      return JSON.parse(this.body || '{}')
    }
  }
})

Object.defineProperty(global, 'Response', {
  value: class Response {
    constructor(body, options = {}) {
      this.body = body
      this.status = options.status || 200
      this.headers = new Headers(options.headers || {})
      this.ok = this.status >= 200 && this.status < 300
    }
    
    async json() {
      return JSON.parse(this.body || '{}')
    }
    
    static json(data, options = {}) {
      return new Response(JSON.stringify(data), {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
    }
  }
})

Object.defineProperty(global, 'Headers', {
  value: class Headers {
    constructor(init = {}) {
      this.headers = new Map()
      if (init) {
        Object.entries(init).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value)
        })
      }
    }
    
    get(name) {
      return this.headers.get(name.toLowerCase())
    }
    
    set(name, value) {
      this.headers.set(name.toLowerCase(), value)
    }
    
    has(name) {
      return this.headers.has(name.toLowerCase())
    }
  }
})

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  })),
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    agent: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    knowledgeSource: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    document: {
      findMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    processingLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Global test utilities
global.fetch = jest.fn()
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})

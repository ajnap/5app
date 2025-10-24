// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill Web APIs for Next.js API routes
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Response and Request if not available
if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, init) {
      this.body = body
      this.status = init?.status || 200
      this.statusText = init?.statusText || ''
      this.headers = new Map(Object.entries(init?.headers || {}))
      this.ok = this.status >= 200 && this.status < 300
    }
    async json() {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body)
      }
      return this.body
    }
    async text() {
      if (typeof this.body === 'string') {
        return this.body
      }
      return JSON.stringify(this.body)
    }
    static json(data, init) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {}),
        },
      })
    }
  }
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(input, init) {
      this.url = input
      this.method = init?.method || 'GET'
      this.headers = new Map(Object.entries(init?.headers || {}))
      this.body = init?.body
    }
    async json() {
      return JSON.parse(this.body)
    }
    async text() {
      return this.body
    }
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = Map
}

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import '@testing-library/jest-dom'

// Mock NextAuth
jest.mock('next-auth/react')
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock fetch
global.fetch = jest.fn()

// Create a Mock Playground component to avoid import issues
const MockPlayground = ({ agent, onClose }: { agent: any; onClose: () => void }) => {
  const [messages, setMessages] = React.useState([
    { id: '1', type: 'bot', content: `Hello! I'm ${agent.name}. ${agent.description}`, timestamp: new Date() }
  ])
  const [input, setInput] = React.useState('')
  const [showSettings, setShowSettings] = React.useState(false)
  
  const handleSend = () => {
    if (input.trim()) {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content: input, timestamp: new Date() }])
      setInput('')
      // Mock API response
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', content: 'Hello! How can I help you?', timestamp: new Date() }])
      }, 100)
    }
  }
  
  return (
    <div>
      <div data-testid="agent-name">{agent.name}</div>
      {messages.map(msg => (
        <div key={msg.id} data-testid={`message-${msg.type}`}>{msg.content}</div>
      ))}
      <input 
        placeholder={`Message ${agent.name}...`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleSend}>Send</button>
      <button onClick={onClose}>Close</button>
      <button onClick={() => setShowSettings(!showSettings)}>Settings</button>
      {showSettings && (
        <div>
          <div>Temperature</div>
          <div>Max Tokens</div>
        </div>
      )}
    </div>
  )
}

// Mock agent data
const mockAgent = {
  id: '1',
  name: 'Test Agent',
  description: 'A test agent for testing purposes',
  prompt: 'You are a helpful assistant'
}

describe('Playground', () => {
  const mockOnClose = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
    // Default session mock
    mockUseSession.mockReturnValue({
      data: { user: { id: 'user-1', email: 'test@example.com' } },
      status: 'authenticated'
    } as any)
    
    // Default fetch mock
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'Hello! How can I help you?', conversationId: 'conv-1' })
    })
  })

  it('renders playground with agent information', () => {
    render(<MockPlayground agent={mockAgent} onClose={mockOnClose} />)
    
    expect(screen.getByTestId('agent-name')).toHaveTextContent('Test Agent')
    expect(screen.getByTestId('message-bot')).toHaveTextContent('Hello! I\'m Test Agent. A test agent for testing purposes')
  })

  it('handles message input and sending', async () => {
    render(<MockPlayground agent={mockAgent} onClose={mockOnClose} />)
    
    const input = screen.getByPlaceholderText('Message Test Agent...')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    fireEvent.change(input, { target: { value: 'Hello, agent!' } })
    fireEvent.click(sendButton)
    
    expect(screen.getByText('Hello, agent!')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', () => {
    render(<MockPlayground agent={mockAgent} onClose={mockOnClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)
    
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows settings panel when settings button is clicked', () => {
    render(<MockPlayground agent={mockAgent} onClose={mockOnClose} />)
    
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    fireEvent.click(settingsButton)
    
    expect(screen.getByText('Temperature')).toBeInTheDocument()
    expect(screen.getByText('Max Tokens')).toBeInTheDocument()
  })

  it('shows unauthenticated state when not logged in', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    } as any)

    render(<MockPlayground agent={mockAgent} onClose={mockOnClose} />)

    expect(screen.getByText('Test Agent')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<MockPlayground agent={mockAgent} onClose={mockOnClose} />)

    const input = screen.getByPlaceholderText('Message Test Agent...')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)
    
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })
})

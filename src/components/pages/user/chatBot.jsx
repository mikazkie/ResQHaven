import { useEffect, useRef, useState } from 'react'
import { postRequest } from '../../../API/API'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: 'Hi! I am the ResQHaven AI assistant. I can help you find evacuation centers, check active alerts, and provide emergency hotlines. How can I help you?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth'
    })
  }, [messages, isOpen])

  const quickQuestions = [
    'Open centers?',
    'Active alerts?',
    'Emergency hotlines?',
    'Safety tips?'
  ]

  const isNoticeMessage = (text) => {
    const normalized = String(text || '').toLowerCase()
    return normalized.includes('limit the chat') || normalized.includes('limited credits')
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        text: userMessage
      }
    ])

    setLoading(true)

    try {
      const response = await postRequest('auth/chat', {
        message: userMessage
      })

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: response.message
        }
      ])
    } catch (error) {
      const fallbackMessage =
        error?.response?.data?.message ||
        'Sorry, I am having trouble responding. Please try again.'

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: fallbackMessage
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .chat-window {
          position: fixed;
          bottom: 90px;
          right: 24px;
          width: 350px;
          height: 500px;
          z-index: 9998;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }
        .chat-messages::-webkit-scrollbar {
          width: 4px;
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background: #dee2e6;
          border-radius: 4px;
        }
        .msg-bot {
          border-radius: 12px 12px 12px 0 !important;
        }
        .msg-user {
          border-radius: 12px 12px 0 12px !important;
        }
        .chat-notice {
          background: #fff8eb;
          border: 1px solid rgba(241, 143, 1, 0.28);
          color: #8a5600;
        }
        .chat-bubble-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          width: 56px;
          height: 56px;
          font-size: 1.5rem;
          border-radius: 50% !important;
        }
        @media (max-width: 576px) {
          .chat-window {
            width: calc(100vw - 32px);
            top: 16px;
            bottom: auto;
            right: 16px;
            height: min(500px, calc(100vh - 96px));
          }
          .chat-bubble-btn {
            top: 16px;
            bottom: auto;
            right: 16px;
          }
        }
      `}</style>

      {isOpen && (
        <div className='chat-window card border-0 shadow'>
          <div
            className='card-header bg-danger border-0 p-3 d-flex align-items-center justify-content-between'
          >
            <div className='d-flex align-items-center gap-2'>
              <div
                className='bg-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0'
                style={{ width: 38, height: 38, fontSize: '1.2rem' }}
              >
                <i className='bi bi-robot' />
              </div>
              <div>
                <div className='text-white fw-semibold' style={{ fontSize: 14 }}>
                  ResQHaven AI
                </div>
                <div className='text-white-50' style={{ fontSize: 11 }}>
                  Online and ready to help
                </div>
              </div>
            </div>
            <button
              className='btn btn-sm text-white border-0 p-0'
              onClick={() => setIsOpen(false)}
              style={{ fontSize: '1.1rem' }}
            >
              x
            </button>
          </div>

          <div className='chat-messages bg-light'>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`d-flex mb-2 ${
                  msg.role === 'user'
                    ? 'justify-content-end'
                    : 'justify-content-start'
                }`}
              >
                {msg.role === 'bot' && (
                  <div className='me-2 flex-shrink-0' style={{ fontSize: '1.1rem' }}>
                    <i className='bi bi-robot' />
                  </div>
                )}

                <div
                  className={`p-2 px-3 ${
                    msg.role === 'user'
                      ? 'bg-danger text-white msg-user'
                      : isNoticeMessage(msg.text)
                        ? 'chat-notice msg-bot'
                        : 'bg-white border msg-bot'
                  }`}
                  style={{
                    maxWidth: '80%',
                    fontSize: 13,
                    lineHeight: 1.5
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className='d-flex justify-content-start mb-2'>
                <div className='me-2' style={{ fontSize: '1.1rem' }}>
                  <i className='bi bi-robot' />
                </div>
                <div
                  className='bg-white border p-2 px-3 msg-bot text-muted d-flex align-items-center gap-2'
                  style={{ fontSize: 13 }}
                >
                  <span className='spinner-grow spinner-grow-sm text-danger' />
                  <span
                    className='spinner-grow spinner-grow-sm text-danger'
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className='spinner-grow spinner-grow-sm text-danger'
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className='card-footer bg-white border-top p-3'>
            <div className='d-flex flex-wrap gap-1 mb-2'>
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  className='btn btn-outline-secondary btn-sm'
                  style={{ fontSize: 11 }}
                  onClick={() => setInput(question)}
                >
                  {question}
                </button>
              ))}
            </div>

            <div className='input-group'>
              <input
                type='text'
                className='form-control'
                placeholder='Type a message...'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSend()
                  }
                }}
                style={{ fontSize: 13 }}
                disabled={loading}
              />
              <button
                className='btn btn-danger'
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <span className='spinner-border spinner-border-sm' />
                ) : (
                  'Send'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className='btn btn-danger shadow chat-bubble-btn d-flex align-items-center justify-content-center'
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'x' : <i className='bi bi-robot' />}
      </button>
    </>
  )
}

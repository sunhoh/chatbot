'use client'

import {
  type CSSProperties,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useChat } from '@/hook/useChat'
import { getTenantConfig } from '@/utils/tenant.utils'
import type { Suggestion } from '@/types/tenant.type'

const tenant = getTenantConfig('luho')

function TenantMark({
  className = '',
  logoUrl,
  fallback,
  primaryColor,
}: {
  className?: string
  logoUrl?: string
  fallback: string
  primaryColor: string
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-serif italic text-[#f9f4ed] ${className}`}
      style={{ backgroundColor: primaryColor }}
    >
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </div>
  )
}

function formatMessageTime(timestamp: Date) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

export default function Home() {
  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, isLoading, isInitializing, error, suggestions } = useChat({
    tenantKey: tenant.tenantKey,
  })

  const { theme } = tenant
  const widgetStyle = {
    width: theme.width,
    height: theme.height,
    backgroundColor: theme.backgroundColor,
  } satisfies CSSProperties

  const lastMessage = messages[messages.length - 1]
  const shouldShowTyping = isLoading && lastMessage?.sender === 'user'

  const hasUserMessages = messages.some(m => m.sender === 'user')
  const defaultSuggestions: Suggestion[] = theme.suggestedQuestions.map(q => ({ label: q, type: 'message', text: q }))
  const displaySuggestions = suggestions ?? (!hasUserMessages ? defaultSuggestions : undefined)
  const canShowSuggestions = (displaySuggestions?.length ?? 0) > 0 && !isLoading && !isInitializing

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, shouldShowTyping])

  const submitMessage = (message: string) => {
    const nextMessage = message.trim()

    if (!nextMessage || isLoading || isInitializing) return

    sendMessage(nextMessage)
    setDraft('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submitMessage(draft)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submitMessage(draft)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ece4d8] p-4 text-[#2c2723]">
      <section
        className="flex max-h-[calc(100vh-32px)] max-w-full flex-col overflow-hidden rounded-[22px] border border-[#ded5ca] shadow-[0_18px_50px_rgba(61,49,38,0.20)]"
        style={widgetStyle}
      >
        <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-[#eadfd5] px-5">
          <div className="flex items-center gap-3">
            <TenantMark
              className="h-9 w-9 text-sm"
              fallback={theme.logoFallback}
              logoUrl={theme.logoUrl}
              primaryColor={theme.primaryColor}
            />
            <div>
              <h1 className="font-serif text-lg font-semibold leading-none tracking-normal text-[#2a231f]">
                {theme.botName}
              </h1>
              <div className="mt-1.5 flex items-center gap-1.5 text-sm leading-none text-[#7f746c]">
                <span className="h-2 w-2 rounded-full bg-[#9bbb8f]" />
                <span>Online</span>
              </div>
            </div>
          </div>

          {/* <button
            type="button"
            aria-label="Close chatbot"
            className="flex h-8 w-8 items-center justify-center rounded-full text-2xl leading-none text-[#b4a79d] transition hover:bg-[#f4eee8] hover:text-[#7d7168]"
          >
            ×
          </button> */}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-4">
            {isInitializing && messages.length === 0 ? (
              <div className="flex items-start gap-3">
                <TenantMark
                  className="mt-0.5 h-8 w-8 text-xs"
                  fallback={theme.logoFallback}
                  logoUrl={theme.logoUrl}
                  primaryColor={theme.primaryColor}
                />
                <div className="rounded-[14px] border border-[#eadfd5] bg-white px-4 py-3 text-sm leading-6 text-[#2c2723]">
                  Preparing your beauty companion...
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.sender === 'user'

                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <TenantMark
                        className="mt-0.5 h-8 w-8 text-xs"
                        fallback={theme.logoFallback}
                        logoUrl={theme.logoUrl}
                        primaryColor={theme.primaryColor}
                      />
                    )}

                    <div className={`flex max-w-[292px] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`whitespace-pre-wrap rounded-[14px] px-4 py-3 text-sm leading-6 ${
                          isUser
                            ? 'text-[#fffaf3]'
                            : 'border border-[#eadfd5] bg-white text-[#2c2723]'
                        }`}
                        style={isUser ? { backgroundColor: theme.primaryColor } : undefined}
                      >
                        {message.content}
                        {message.link && (
                          <a
                            href={message.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-1 text-xs font-medium text-[#8a7d74] underline underline-offset-2 hover:text-[#5c5049]"
                          >
                            자세히 보기 →
                          </a>
                        )}
                      </div>
                      <time className="mt-1.5 pl-1 text-xs text-[#b4a79d]">
                        {formatMessageTime(message.timestamp)}
                      </time>
                    </div>
                  </div>
                )
              })
            )}

            {shouldShowTyping && (
              <div className="flex items-start gap-3">
                <TenantMark
                  className="mt-0.5 h-8 w-8 text-xs"
                  fallback={theme.logoFallback}
                  logoUrl={theme.logoUrl}
                  primaryColor={theme.primaryColor}
                />
                <div className="rounded-[14px] border border-[#eadfd5] bg-white px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#b8aca2]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#b8aca2] [animation-delay:0.12s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#b8aca2] [animation-delay:0.24s]" />
                  </div>
                </div>
              </div>
            )}

            {canShowSuggestions && (
              <>
                <div className="flex flex-wrap gap-2">
                  {displaySuggestions?.map((s) => {
                    const cls = "rounded-full border border-[#d6c7ba] bg-[#fffdf9] px-3.5 py-1.5 text-sm leading-none text-[#6e635c] transition hover:border-[#bfae9f] hover:bg-gray-100"
                    if (s.type === 'link')
                      return (
                        <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className={cls}>
                          {s.label}
                        </a>
                      )
                    if (s.type === 'phone')
                      return (
                        <a key={s.label} href={`tel:${s.number}`} className={cls}>
                          {s.label}
                        </a>
                      )
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => submitMessage(s.text)}
                        className={cls}
                        disabled={isLoading || isInitializing}
                      >
                        {s.label}
                      </button>
                    )
                  })}
                </div>
                <span className='text-xs text-gray-300'>※ trackA testing...</span>
              </>
            )}

            {error && <p className="text-xs leading-5 text-[#9f4b3d]">{error}</p>}

            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="shrink-0 border-t border-[#eadfd5] p-3">
          <form
            onSubmit={handleSubmit}
            className="flex min-h-[46px] items-center gap-2 rounded-[14px] border border-[#ded1c6] bg-[#fbf7f2] px-4 py-2"
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={theme.placeholder}
              className="min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-6 text-[#2c2723] outline-none placeholder:text-[#b9aea6]"
              disabled={isInitializing}
            />
            <button
              type="submit"
              disabled={!draft.trim() || isLoading || isInitializing}
              aria-label="Send message"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base text-[#fffaf3] transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: theme.primaryColor }}
            >
              <span aria-hidden="true">&gt;</span>
            </button>
          </form>
        </footer>
      </section>
    </div>
  )
}

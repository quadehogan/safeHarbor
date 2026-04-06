import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type NotificationContextValue = {
  message: string | null
  setMessage: (message: string | null) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const setMessageSafe = useCallback((m: string | null) => setMessage(m), [])
  const value = useMemo(
    () => ({ message, setMessage: setMessageSafe }),
    [message, setMessageSafe],
  )
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useNotification(): NotificationContextValue {
  const ctx = use(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}

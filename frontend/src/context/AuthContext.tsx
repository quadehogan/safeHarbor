import {
  createContext,
  use,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type AuthContextValue = {
  token: string | null
  email: string | null
  roles: string[]
  setAuth: (token: string, email: string, roles: string[]) => void
  clearAuth: () => void
  isAdmin: boolean
  isSocialWorker: boolean
  isDonor: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadFromStorage() {
  try {
    const token = localStorage.getItem('token')
    const email = localStorage.getItem('email')
    const roles = JSON.parse(localStorage.getItem('roles') ?? '[]') as string[]
    return { token, email, roles }
  } catch {
    return { token: null, email: null, roles: [] }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage()
  const [token, setToken] = useState<string | null>(stored.token)
  const [email, setEmail] = useState<string | null>(stored.email)
  const [roles, setRoles] = useState<string[]>(stored.roles)

  const setAuth = useCallback((t: string, e: string, r: string[]) => {
    localStorage.setItem('token', t)
    localStorage.setItem('email', e)
    localStorage.setItem('roles', JSON.stringify(r))
    setToken(t)
    setEmail(e)
    setRoles(r)
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('roles')
    setToken(null)
    setEmail(null)
    setRoles([])
  }, [])

  const value = useMemo(
    () => ({
      token,
      email,
      roles,
      setAuth,
      clearAuth,
      isAdmin: roles.includes('Admin'),
      isSocialWorker: roles.includes('SocialWorker'),
      isDonor: roles.includes('DonorPortal'),
    }),
    [token, email, roles, setAuth, clearAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook paired with provider
export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Props = {
  children: ReactNode
  roles?: string[]
}

export function ProtectedRoute({ children, roles }: Props) {
  const { token, roles: userRoles } = useAuth()

  if (!token) return <Navigate to="/" replace />

  if (roles && !roles.some(r => userRoles.includes(r))) {
    return <Navigate to="/" replace />
  }

  return children
}

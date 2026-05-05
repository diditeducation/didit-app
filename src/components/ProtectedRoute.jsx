import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()

  // Still resolving auth state — render nothing to avoid a flash of
  // the protected page before the redirect fires.
  if (user === undefined) return null

  // Not signed in — send to the sign-in page.
  if (user === null) return <Navigate to="/signin" replace />

  return children
}

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  // TODO: Re-enable auth check once Firebase is configured
  // const { user } = useAuth()
  // if (user === undefined) { return <Loading /> }
  // if (user === null) { return <Navigate to="/signin" replace /> }
  return children
}

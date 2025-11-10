import { createContext, useState, useEffect } from 'react'
import api from '../utils/api'

export const AuthContext = createContext()  // Named export here

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setIsLoggedIn(true)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user: userData } = response.data
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setIsLoggedIn(true)
      setUser(userData)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' }
    }
  }

  const register = async (email, password) => {
    try {
      await api.post('/auth/register', { email, password })
      return await login(email, password)
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setIsLoggedIn(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext  // Default for flexibility, but named works now


// import { createContext, useState, useEffect } from 'react'
// import api from '../utils/api'

// export const AuthContext = createContext()

// export const AuthProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const token = localStorage.getItem('token')
//     if (token) {
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`
//       setIsLoggedIn(true)
//       try {
//         const payload = JSON.parse(atob(token.split('.')[1]))
//         setUser(payload)
//       } catch (e) {
//         console.error('Token parse error:', e)
//       }
//     }
//     setLoading(false)
//   }, [])

//   const login = async (email, password) => {
//     try {
//       const response = await api.post('/auth/login', { email, password })
//       const { token, user: userData } = response.data
//       localStorage.setItem('token', token)
//       api.defaults.headers.common['Authorization'] = `Bearer ${token}`
//       setIsLoggedIn(true)
//       setUser(userData)
//       return { success: true }
//     } catch (error) {
//       return { success: false, error: error.response?.data?.error || 'Login failed' }
//     }
//   }

//   const register = async (email, password) => {
//     try {
//       await api.post('/auth/register', { email, password })
//       return await login(email, password)
//     } catch (error) {
//       return { success: false, error: error.response?.data?.error || 'Registration failed' }
//     }
//   }

//   const logout = () => {
//     localStorage.removeItem('token')
//     delete api.defaults.headers.common['Authorization']
//     setIsLoggedIn(false)
//     setUser(null)
//   }

//   const value = { isLoggedIn, user, loading, login, register, logout }

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export default AuthContext
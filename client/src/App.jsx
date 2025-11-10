import { Routes, Route, Navigate } from 'react-router-dom'
import { useContext } from 'react'
import { AuthProvider, AuthContext } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AssetDetails from './pages/AssetDetails'
import AssetEdit from './pages/AssetEdit'
import Reports from './pages/Reports'
import TrackMap from './pages/TrackMap' // Adjust path

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useContext(AuthContext)
  if (loading) return <div className="flex justify-center items-center min-h-screen text-dark-text">Loading...</div>
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

function AppContent() {
  const { isLoggedIn } = useContext(AuthContext)

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text">
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/assets/:uid" element={<ProtectedRoute><AssetDetails /></ProtectedRoute>} />
        <Route path="/assets/:uid/edit" element={<ProtectedRoute><AssetEdit /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><TrackMap /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

//import { Routes, Route, Navigate } from 'react-router-dom'
// import { useContext } from 'react'
// import { AuthProvider, AuthContext } from './context/AuthContext'
// import Navbar from './components/Navbar'
// import Login from './pages/Login'
// import Register from './pages/Register'
// import Dashboard from './pages/Dashboard'
// import AssetDetails from './pages/AssetDetails'
// import AssetEdit from './pages/AssetEdit'
// import Reports from './pages/Reports'
// import TrackMap from './pages/TrackMap'  // New import for the map page

// function ProtectedRoute({ children }) {
//   const { isLoggedIn, loading } = useContext(AuthContext)
//   if (loading) return <div className="flex justify-center items-center min-h-screen text-dark-text">Loading...</div>
//   return isLoggedIn ? children : <Navigate to="/login" replace />
// }

// function AppContent() {
//   const { isLoggedIn } = useContext(AuthContext)

//   return (
//     <div className="min-h-screen bg-dark-bg text-dark-text">
//       {isLoggedIn && <Navbar />}
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
//         <Route path="/assets/:uid" element={<ProtectedRoute><AssetDetails /></ProtectedRoute>} />
//         <Route path="/assets/:uid/edit" element={<ProtectedRoute><AssetEdit /></ProtectedRoute>} />
//         <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
//         <Route path="/map" element={<ProtectedRoute><TrackMap /></ProtectedRoute>} />  // New: Track Map route
//         <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
//       </Routes>
//     </div>
//   )
// }

// function App() {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   )
// }

// export default App
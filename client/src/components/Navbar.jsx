

// import { Link, useNavigate } from 'react-router-dom'
// import { useContext, useState, useEffect } from 'react'
// import { AuthContext } from '../context/AuthContext'
// import PredictModal from './PredictModal'  // New import for the modal

// const Navbar = () => {
//   const { logout, user } = useContext(AuthContext)
//   const navigate = useNavigate()
//   const [TrainTrack, setTrainTrack] = useState(null)
//   const [tokenKey, setTokenKey] = useState(localStorage.getItem('token') || 'default')
//   const [showPredictModal, setShowPredictModal] = useState(false)  // New: State for modal visibility

//   useEffect(() => {
//     // Re-run import if token changes (forces fresh load)
//     const currentToken = localStorage.getItem('token')
//     if (currentToken !== tokenKey) {
//       setTokenKey(currentToken)
//       setTrainTrack(null)  // Reset to re-load
//     }

//     import('lucide-react').then((module) => {
//       setTrainTrack(() => module.TrainTrack)
//     }).catch((err) => {
//       console.error('Icon load error:', err)
//     })
//   }, [tokenKey])  // Dep on tokenKey to re-run on login

//   const handleLogout = () => {
//     logout()
//     navigate('/login')
//   }

//   return (
//     <nav className="bg-dark-surface border-b border-dark-border px-4 py-3">
//       <div className="flex justify-between items-center max-w-7xl mx-auto flex-wrap">
//         <div className="flex items-center space-x-2">
//           {TrainTrack ? (
//             <TrainTrack className="h-6 w-6 text-primary-500" />
//           ) : (
//             <span className="h-6 w-6 text-primary-500 font-bold">🚂</span>  // Fallback emoji (shows instantly)
//           )}
//           <Link to="/" className="text-xl font-bold text-primary-500">Railway AMS</Link>
//         </div>
//         <div className="flex space-x-8 items-center flex-1 justify-center md:justify-end md:space-x-8">
//           <Link to="/" className="text-dark-text hover:text-primary-500">Asset Dashboard</Link>
//           <Link to="/reports" className="text-dark-text hover:text-primary-500">AI Reports</Link>
//           <button 
//             onClick={() => setShowPredictModal(true)} 
//             className="text-dark-text hover:text-primary-500"  // Matches other link styles
//           >
//             Predict Fittings
//           </button>
//           <span className="text-dark-muted hidden md:inline">Hi, {user?.email}</span>
//         </div>
//         <button onClick={handleLogout} className="btn-secondary ml-4">Logout</button>
//       </div>
//       {/* New: Predict Fittings Modal */}
//       <PredictModal isOpen={showPredictModal} onClose={() => setShowPredictModal(false)} />
//     </nav>
//   )
// }

// export default Navbar

import { Link, useNavigate } from 'react-router-dom'
import { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import PredictModal from './PredictModal'  // New import for the modal

const Navbar = () => {
  const { logout, user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [TrainTrack, setTrainTrack] = useState(null)
  const [tokenKey, setTokenKey] = useState(localStorage.getItem('token') || 'default')
  const [showPredictModal, setShowPredictModal] = useState(false)  // New: State for modal visibility

  useEffect(() => {
    // Re-run import if token changes (forces fresh load)
    const currentToken = localStorage.getItem('token')
    if (currentToken !== tokenKey) {
      setTokenKey(currentToken)
      setTrainTrack(null)  // Reset to re-load
    }

    import('lucide-react').then((module) => {
      setTrainTrack(() => module.TrainTrack)
    }).catch((err) => {
      console.error('Icon load error:', err)
    })
  }, [tokenKey])  // Dep on tokenKey to re-run on login

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-dark-surface border-b border-dark-border px-4 py-3">
      <div className="flex justify-between items-center max-w-7xl mx-auto flex-wrap">
        <div className="flex items-center space-x-2">
          {TrainTrack ? (
            <TrainTrack className="h-6 w-6 text-primary-500" />
          ) : (
            <span className="h-6 w-6 text-primary-500 font-bold">🚂</span>  // Fallback emoji (shows instantly)
          )}
          <Link to="/" className="text-xl font-bold text-primary-500">Railway AMS</Link>
        </div>
        <div className="flex space-x-8 items-center flex-1 justify-center md:justify-end md:space-x-8">
          <Link to="/" className="text-dark-text hover:text-primary-500">Asset Dashboard</Link>
          <Link to="/reports" className="text-dark-text hover:text-primary-500">AI Reports</Link>
          <Link to="/map" className="text-dark-text hover:text-primary-500">Track Map</Link>
          <button 
            onClick={() => setShowPredictModal(true)} 
            className="text-dark-text hover:text-primary-500"  // Matches other link styles
          >
            Predict Fittings
          </button>
          <span className="text-dark-muted hidden md:inline">Hi, {user?.email}</span>
        </div>
        <button onClick={handleLogout} className="btn-secondary ml-4">Logout</button>
      </div>
      {/* New: Predict Fittings Modal */}
      <PredictModal isOpen={showPredictModal} onClose={() => setShowPredictModal(false)} />
    </nav>
  )
}

export default Navbar


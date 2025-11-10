// import { useState, useEffect } from 'react'
// import { useParams, useNavigate, Link } from 'react-router-dom'
// import api from '../utils/api'

// const AssetEdit = () => {
//   const { uid } = useParams()
//   const navigate = useNavigate()
//   const [formData, setFormData] = useState({
//     condition_lot: '',
//     remarks: '',
//     last_inspection: '',
//   })
//   const [loading, setLoading] = useState(true)
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     const fetchAsset = async () => {
//       try {
//         const response = await api.get(`/assets/${uid}`)
//         const item = response.data.item
//         setFormData({
//           condition_lot: item.condition_lot || '',
//           remarks: item.remarks || '',
//           last_inspection: item.last_inspection ? new Date(item.last_inspection).toISOString().split('T')[0] : '',
//         })
//       } catch (err) {
//         setError('Failed to fetch asset')
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchAsset()
//   }, [uid])

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setSaving(true)
//     setError('')
//     try {
//       await api.post(`/assets/${uid}`, formData)
//       navigate(`/assets/${uid}`)
//     } catch (err) {
//       setError(err.response?.data?.error || 'Failed to update')
//     } finally {
//       setSaving(false)
//     }
//   }

//   if (loading) return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">Edit Asset</h1>
//         <Link to={`/assets/${uid}`} className="btn-secondary">Cancel</Link>
//       </div>
//       <form onSubmit={handleSubmit} className="space-y-6 bg-dark-surface p-6 rounded-lg shadow">
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-dark-muted mb-2">Condition Lot</label>
//             <select name="condition_lot" className="input-field" value={formData.condition_lot} onChange={handleChange} required>
//               <option value="">Select Condition</option>
//               <option value="Good">Good</option>
//               <option value="Needs Repair">Needs Repair</option>
//               <option value="Need Replacement">Need Replacement</option>
//             </select>
//           </div>
//           <input name="remarks" type="text" className="input-field" placeholder="Remarks" value={formData.remarks} onChange={handleChange} />
//           <input name="last_inspection" type="date" className="input-field" value={formData.last_inspection} onChange={handleChange} />
//         </div>
//         {error && <p className="text-red-500 text-sm">{error}</p>}
//         <div className="flex justify-end space-x-3">
//           <Link to={`/assets/${uid}`} className="btn-secondary">Cancel</Link>
//           <button type="submit" disabled={saving} className="btn-primary">
//             {saving ? 'Saving...' : 'Save Changes'}
//           </button>
//         </div>
//       </form>
//     </div>
//   )
// }

// export default AssetEdit

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'

const AssetEdit = () => {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    condition_lot: '',
    remarks: '',
    last_inspection: '',
    latitude: '',
    longitude: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const response = await api.get(`/assets/${uid}`)
        const item = response.data.item
        setFormData({
          condition_lot: item.condition_lot || '',
          remarks: item.remarks || '',
          last_inspection: item.last_inspection ? new Date(item.last_inspection).toISOString().split('T')[0] : '',
          latitude: item.latitude || '',
          longitude: item.longitude || '',
        })
      } catch (err) {
        setError('Failed to fetch asset')
      } finally {
        setLoading(false)
      }
    }
    fetchAsset()
  }, [uid])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser')
      return
    }
    setError('') // Clear prior errors
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }))
      },
      (err) => {
        setError(`GPS access denied or failed: ${err.message}. Please enter coordinates manually.`)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 } // High accuracy, 10s timeout
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.post(`/assets/${uid}`, formData)
      navigate(`/assets/${uid}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update asset')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Asset</h1>
        <Link to={`/assets/${uid}`} className="btn-secondary">Cancel</Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-dark-surface p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-muted mb-2">Condition Lot</label>
            <select name="condition_lot" className="input-field" value={formData.condition_lot} onChange={handleChange} required>
              <option value="">Select Condition</option>
              <option value="Good">Good</option>
              <option value="Needs Repair">Needs Repair</option>
              <option value="Need Replacement">Need Replacement</option>
            </select>
          </div>
          <input name="remarks" type="text" className="input-field" placeholder="Remarks" value={formData.remarks} onChange={handleChange} />
          <input name="last_inspection" type="date" className="input-field" value={formData.last_inspection} onChange={handleChange} />
          {/* New Geo Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-muted mb-2">Latitude (optional)</label>
              <div className="flex space-x-2">
                <input 
                  name="latitude" 
                  type="number" 
                  step="any" 
                  className="input-field flex-1" 
                  value={formData.latitude} 
                  onChange={handleChange} 
                  placeholder="e.g., 19.0760" 
                />
                <button type="button" onClick={handleGeoLocation} className="btn-secondary px-3 py-2 text-xs">
                  GPS
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-muted mb-2">Longitude (optional)</label>
              <input 
                name="longitude" 
                type="number" 
                step="any" 
                className="input-field" 
                value={formData.longitude} 
                onChange={handleChange} 
                placeholder="e.g., 72.8777" 
              />
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex justify-end space-x-3">
          <Link to={`/assets/${uid}`} className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AssetEdit


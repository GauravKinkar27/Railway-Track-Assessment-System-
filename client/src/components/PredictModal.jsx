import { useState } from 'react'
import api from '../utils/api'

const PredictModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({ line_length_km: '', gauge_type: 'BG' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const response = await api.post('/predict-fittings', formData)
      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-surface p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Predict Fittings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-muted mb-2">Line Length (km)</label>
            <input
              type="number"
              name="line_length_km"
              className="input-field"
              value={formData.line_length_km}
              onChange={handleChange}
              required
              min="0.1"
              step="0.1"
              placeholder="e.g., 10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-muted mb-2">Gauge Type</label>
            <select name="gauge_type" className="input-field" value={formData.gauge_type} onChange={handleChange}>
              <option value="BG">Broad Gauge (BG)</option>
              <option value="MG">Meter Gauge (MG)</option>
              <option value="NG">Narrow Gauge (NG)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary">
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        {result && (
          <div className="mt-4 space-y-2 p-4 bg-dark-surface rounded-lg border border-dark-border">
            <h3 className="font-bold text-dark-text mb-2">Results ({result.gauge_type}, {result.line_length_km} km):</h3>
            <p className="text-lg font-bold text-dark-text">Sleepers: {result.sleepers.toLocaleString()}</p>
            <p className="text-lg font-bold text-dark-text">Railpads: {result.railpads.toLocaleString()}</p>
            <p className="text-lg font-bold text-dark-text">Liners: {result.liners.toLocaleString()}</p>
          </div>
        )}
        <button onClick={onClose} className="w-full btn-secondary mt-4">Close</button>
      </div>
    </div>
  )
}

export default PredictModal
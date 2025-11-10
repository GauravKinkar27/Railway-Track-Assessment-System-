import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import Tilt from 'react-vanilla-tilt'

const Dashboard = () => {
  const [assets, setAssets] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCondition, setSelectedCondition] = useState('All')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError('')
        const [assetsRes, statsRes] = await Promise.all([
          api.get('/assets').catch(() => ({ data: [] })),
          api.get('/dashboard').catch(() => ({ data: {} }))
        ])
        setAssets(assetsRes.data)
        setStats(statsRes.data)
      } catch (err) {
        setError('Failed to fetch data: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.uid.toLowerCase().includes(searchTerm.toLowerCase())
    let matchesCondition = selectedCondition === 'All'
    if (selectedCondition === 'Good') {
      matchesCondition = asset.condition_lot.toLowerCase().includes('good')
    } else if (selectedCondition === 'Needs Repair') {
      matchesCondition = asset.condition_lot.toLowerCase().includes('need repair')
    } else if (selectedCondition === 'Need Replacement') {
      matchesCondition = asset.condition_lot.toLowerCase().includes('need replacement')
    }
    return matchesSearch && matchesCondition
  })

  if (loading) return <div className="flex justify-center items-center min-h-[50vh] text-dark-text">Loading...</div>
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Asset Dashboard</h1>
        <div className="flex space-x-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by UID..."
            className="input-field px-4 py-2 flex-1 md:flex-none md:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            value={selectedCondition} 
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="input-field px-4 py-2 w-48"
          >
            <option value="All">All Conditions</option>
            <option value="Good">Good</option>
            <option value="Needs Repair">Needs Repair</option>
            <option value="Need Replacement">Need Replacement</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Assets', value: stats.total || 0, color: 'text-green-500' },
          { label: 'Good Condition', value: stats.good || 0, color: 'text-blue-500' },
          { label: 'Needs Repair', value: stats.needsRepair || 0, color: 'text-yellow-500' },
          { label: 'Soon Expiring', value: stats.soonExpiring || 0, color: 'text-red-500' }
        ].map(({ label, value, color }) => (
          <Tilt key={label} options={{ max: 15, scale: 1.02 }}>
            <div className="bg-dark-surface p-4 rounded-lg shadow cursor-grab active:cursor-grabbing">
              <h3 className="font-semibold text-dark-muted">{label}</h3>
              <p className={`text-2xl ${color}`}>{value}</p>
            </div>
          </Tilt>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="table bg-dark-surface rounded-lg shadow">
          <thead className="bg-dark-border">
            <tr>
              <th>UID</th>
              <th>Vendor Name</th>
              <th>Condition</th>
              <th>Warranty Expiry</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.uid} className="hover:bg-dark-border">
                <td>{asset.uid}</td>
                <td>{asset.vendor_name || 'N/A'}</td>
                <td>{asset.condition_lot || 'N/A'}</td>
                <td>{asset.warranty_expiry || 'N/A'}</td>
                <td>
                  <Link to={`/assets/${asset.uid}`} className="btn-primary text-xs py-1 px-3">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredAssets.length === 0 && (
        <p className="text-dark-muted text-center mt-4">
          {searchTerm || selectedCondition !== 'All' ? `No assets found for "${searchTerm || selectedCondition}".` : 'No assets found. Add some data to rail_assets table.'}
        </p>
      )}
    </div>
  )
}

export default Dashboard
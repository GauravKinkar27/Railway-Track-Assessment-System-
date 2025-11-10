import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import Tilt from 'react-vanilla-tilt'

const AssetDetails = () => {
  const { uid } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setError('')
        const response = await api.get(`/assets/${uid}`)
        setData(response.data)
      } catch (err) {
        setError('Failed to fetch asset details: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAsset()
  }, [uid])

  if (loading) return <div className="flex justify-center items-center min-h-[50vh] text-dark-text">Loading...</div>
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>
  if (!data || !data.item) return <div className="text-dark-text text-center p-6">Asset not found</div>

  const { item, assemblyRemark = {}, lotStatusSummary = {}, vendorReport = {}, assetTypeReport = {} } = data

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap">
        <h1 className="text-3xl font-bold">Asset Details: {item.uid}</h1>
        <div className="space-x-2 mt-2 md:mt-0">
          <Link to={`/assets/${uid}/edit`} className="btn-primary">Edit</Link>
          <Link to="/" className="btn-secondary">Back</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: 'PL Number', value: item.pl_number },
          { label: 'Item Type', value: item.asset_type },
          { label: 'Vendor Code', value: item.vendor_code },
          { label: 'Vendor Name', value: item.vendor_name },
          { label: 'Lot No', value: item.lot_no },
          { label: 'Supply Date', value: item.supply_date },
          { label: 'Install Date', value: item.install_date },
          { label: 'Last Inspection', value: item.last_inspection },
          { label: 'Condition', value: item.condition_lot },
          { label: 'Warranty Expiry', value: item.warranty_expiry },
        ].filter(({ value }) => value).map(({ label, value }) => (
          <Tilt key={label} options={{ max: 25, scale: 1.02 }}>
            <div className="bg-dark-surface p-3 rounded-lg shadow border border-dark-border cursor-grab active:cursor-grabbing">
              <h3 className="font-medium text-dark-muted mb-1">
                {label}
              </h3>
              <p className="text-lg font-bold text-dark-text">
                {value}
              </p>
            </div>
          </Tilt>
        ))}
      </div>

      {/* Updated: Analysis Cards - Slimmer & Bolder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Tilt>
          <div className="bg-dark-surface p-3 rounded-lg shadow border border-dark-border cursor-grab active:cursor-grabbing">
            <h3 className="font-bold mb-2">Assembly Remark</h3>
            <p className={`text-lg font-bold ${assemblyRemark.status === 'ok' ? 'text-green-500' : assemblyRemark.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>
              {assemblyRemark.remark || 'N/A'}
            </p>
            <p className="text-dark-muted font-medium">{assemblyRemark.reason || 'No remark'}</p>  {/* Bold-ish for reason */}
          </div>
        </Tilt>
        <Tilt>
          <div className="bg-dark-surface p-3 rounded-lg shadow border border-dark-border cursor-grab active:cursor-grabbing">
            <h3 className="font-bold mb-2">Lot Status Summary</h3>
            <p className="text-lg font-bold text-dark-text">Ready: {lotStatusSummary.ready || 0}</p>
            <p className="text-lg font-bold text-dark-text">Not Ready: {lotStatusSummary.notReady || 0}</p>
          </div>
        </Tilt>
        {vendorReport.total_assets && (
          <Tilt>
            <div className="bg-dark-surface p-3 rounded-lg shadow border border-dark-border cursor-grab active:cursor-grabbing">
              <h3 className="font-bold mb-2">Vendor Report</h3>
              <p className="text-lg font-bold text-dark-text">Total: {vendorReport.total_assets}</p>
              <p className="text-lg font-bold text-dark-text">Good: {vendorReport.good_condition || 0}</p>
            </div>
          </Tilt>
        )}
        {assetTypeReport.total_units && (
          <Tilt>
            <div className="bg-dark-surface p-3 rounded-lg shadow border border-dark-border cursor-grab active:cursor-grabbing">
              <h3 className="font-bold mb-2">Asset Type Report</h3>
              <p className="text-lg font-bold text-dark-text">Total Units: {assetTypeReport.total_units}</p>
              <p className="text-lg font-bold text-dark-text">Avg Days Left: {Math.round(assetTypeReport.avg_days_left_warranty) || 'N/A'}</p>
            </div>
          </Tilt>
        )}
      </div>
    </div>
  )
}

export default AssetDetails
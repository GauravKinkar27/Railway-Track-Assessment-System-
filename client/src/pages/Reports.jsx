// import { useState, useEffect } from 'react'
// import api from '../utils/api'
// import Tilt from 'react-vanilla-tilt'

// const Reports = () => {
//   const [reports, setReports] = useState({ vendors: [], inventory: [] })
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')

//   useEffect(() => {
//     const fetchReports = async () => {
//       try {
//         setError('')
//         const [vendorsRes, inventoryRes] = await Promise.all([
//           api.get('/vendors').catch(() => ({ data: [] })),
//           api.get('/inventory').catch(() => ({ data: [] }))
//         ])
//         setReports({ vendors: vendorsRes.data, inventory: inventoryRes.data })
//       } catch (err) {
//         setError('Failed to fetch reports: ' + err.message)
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchReports()
//   }, [])

//   if (loading) return <div className="flex justify-center items-center min-h-[50vh] text-dark-text">Loading...</div>
//   if (error) return <div className="text-red-500 text-center p-6">{error}</div>

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">AI Reports</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <h2 className="text-2xl font-semibold mb-4">Vendor Report</h2>
//           {reports.vendors.length > 0 ? (
//             reports.vendors.map((vendor, i) => (
//               <Tilt key={i} options={{ max: 15, scale: 1.02 }}>
//                 <div className="bg-dark-surface p-3 rounded-lg shadow-sm border-0 mb-4 cursor-grab active:cursor-grabbing">
//                   <h3 className="font-bold mb-2">Vendor: {vendor.vendor_name}</h3>
//                   <p className="font-medium text-dark-muted mb-1">Total Assets</p>
//                   <p className="text-lg font-bold text-dark-text">{vendor.total_assets}</p>
//                   <p className="font-medium text-dark-muted mb-1">Good</p>
//                   <p className="text-lg font-bold text-dark-text">{vendor.good_condition}</p>
//                   <p className="font-medium text-dark-muted mb-1">Needs Repair</p>
//                   <p className="text-lg font-bold text-dark-text">{vendor.needs_repair}</p>
//                   <div className="h-32 bg-dark-border rounded flex items-center justify-center mt-2">
//                     <span className="text-dark-muted">Vendor Pie Chart</span>
//                   </div>
//                 </div>
//               </Tilt>
//             ))
//           ) : (
//             <p className="text-dark-muted">No vendor data</p>
//           )}
//         </div>
//         <div>
//           <h2 className="text-2xl font-semibold mb-4">Inventory Report</h2>
//           {reports.inventory.length > 0 ? (
//             reports.inventory.map((inv, i) => (
//               <Tilt key={i} options={{ max: 15, scale: 1.02 }}>
//                 <div className="bg-dark-surface p-3 rounded-lg shadow-sm border-0 mb-4 cursor-grab active:cursor-grabbing">
//                   <h3 className="font-bold mb-2">Asset Type: {inv.asset_type}</h3>
//                   <p className="font-medium text-dark-muted mb-1">Total Units</p>
//                   <p className="text-lg font-bold text-dark-text">{inv.total_units}</p>
//                   <p className="font-medium text-dark-muted mb-1">Avg Days Left</p>
//                   <p className="text-lg font-bold text-dark-text">{Math.round(inv.avg_days_left_warranty) || 'N/A'}</p>
//                   <div className="h-32 bg-dark-border rounded flex items-center justify-center mt-2">
//                     <span className="text-dark-muted">Inventory Bar Chart</span>
//                   </div>
//                 </div>
//               </Tilt>
//             ))
//           ) : (
//             <p className="text-dark-muted">No inventory data</p>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Reports

import { useState, useEffect } from 'react'
import api from '../utils/api'
import Tilt from 'react-vanilla-tilt'

const Reports = () => {
  const [reports, setReports] = useState({ vendors: [], inventory: [] })
  const [alerts, setAlerts] = useState([]) // ✅ New: Expiring alerts
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setError('')
        const [vendorsRes, inventoryRes, alertsRes] = await Promise.all([
          api.get('/vendors').catch(() => ({ data: [] })),
          api.get('/inventory').catch(() => ({ data: [] })),
          api.get('/alerts-expiring').catch(() => ({ data: [] })) // ✅ Fetch expiring alerts
        ])
        setReports({ vendors: vendorsRes.data, inventory: inventoryRes.data })
        setAlerts(alertsRes.data)
      } catch (err) {
        setError('Failed to fetch reports: ' + err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (loading) return <div className="flex justify-center items-center min-h-[50vh] text-dark-text">Loading...</div>
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>

  // ✅ Combine alert messages for marquee
  const alertMessage =
    alerts.length > 0
      ? alerts.map(a => `UID-${a.uid} expires ${a.expiry}`).join(' | ')
      : 'No assets expiring soon'

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-6">AI Reports</h1>

      {/* ✅ Scrolling Alert Bar */}
      {alerts.length > 0 && (
        <div className="absolute right-0 top-0 w-64 h-full bg-red-600 bg-opacity-90 flex items-center pr-4">
          <div className="w-full overflow-hidden">
            <div className="animate-marquee whitespace-nowrap text-white font-bold text-sm">
              ⚠️ Alert: {alertMessage} →
            </div>
          </div>
        </div>
      )}

      {/* ✅ Reports Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vendor Report */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Vendor Report</h2>
          {reports.vendors.length > 0 ? (
            reports.vendors.map((vendor, i) => (
              <Tilt key={i} options={{ max: 15, scale: 1.02 }}>
                <div className="bg-dark-surface p-3 rounded-lg shadow-sm border-0 mb-4 cursor-grab active:cursor-grabbing">
                  <h3 className="font-bold mb-2">Vendor: {vendor.vendor_name}</h3>
                  <p className="font-medium text-dark-muted mb-1">Total Assets</p>
                  <p className="text-lg font-bold text-dark-text">{vendor.total_assets}</p>
                  <p className="font-medium text-dark-muted mb-1">Good</p>
                  <p className="text-lg font-bold text-dark-text">{vendor.good_condition}</p>
                  <p className="font-medium text-dark-muted mb-1">Needs Repair</p>
                  <p className="text-lg font-bold text-dark-text">{vendor.needs_repair}</p>
                  <div className="h-32 bg-dark-border rounded flex items-center justify-center mt-2">
                    <span className="text-dark-muted">Vendor Pie Chart</span>
                  </div>
                </div>
              </Tilt>
            ))
          ) : (
            <p className="text-dark-muted">No vendor data</p>
          )}
        </div>

        {/* Inventory Report */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Inventory Report</h2>
          {reports.inventory.length > 0 ? (
            reports.inventory.map((inv, i) => (
              <Tilt key={i} options={{ max: 15, scale: 1.02 }}>
                <div className="bg-dark-surface p-3 rounded-lg shadow-sm border-0 mb-4 cursor-grab active:cursor-grabbing">
                  <h3 className="font-bold mb-2">Asset Type: {inv.asset_type}</h3>
                  <p className="font-medium text-dark-muted mb-1">Total Units</p>
                  <p className="text-lg font-bold text-dark-text">{inv.total_units}</p>
                  <p className="font-medium text-dark-muted mb-1">Avg Days Left</p>
                  <p className="text-lg font-bold text-dark-text">
                    {Math.round(inv.avg_days_left_warranty) || 'N/A'}
                  </p>
                  <div className="h-32 bg-dark-border rounded flex items-center justify-center mt-2">
                    <span className="text-dark-muted">Inventory Bar Chart</span>
                  </div>
                </div>
              </Tilt>
            ))
          ) : (
            <p className="text-dark-muted">No inventory data</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reports








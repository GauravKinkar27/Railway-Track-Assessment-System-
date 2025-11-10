// import { useState, useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
// import { Link } from 'react-router-dom';
// import L from 'leaflet'; // For icons/clustering
// import MarkerClusterGroup from 'react-leaflet-cluster'; // npm i react-leaflet-cluster if not
// import 'leaflet/dist/leaflet.css'; // Inline if not in html
// import api from '../utils/api';

// // Custom icons by condition
// const getIcon = (condition) => {
//   const color = condition?.toLowerCase().includes('good') ? 'green' : 
//                 condition?.toLowerCase().includes('fair') ? 'orange' : 'red';
//   return new L.Icon({
//     iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
//     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
//     iconSize: [25, 41], iconAnchor: [12, 41],
//   });
// };

// const TrackMap = () => {
//   const [assets, setAssets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [center, setCenter] = useState([20.5937, 78.9629]); // India default
//   const [selectedUid, setSelectedUid] = useState(null); // For QR zoom

//   useEffect(() => {
//     const fetchAssets = async () => {
//       try {
//         const res = await api.get('/assets');
//         const geoAssets = res.data.filter(a => a.latitude && a.longitude); // Only with coords
//         setAssets(geoAssets);
//         if (geoAssets.length > 0) {
//           setCenter([geoAssets[0].latitude, geoAssets[0].longitude]); // Zoom to first
//         }
//       } catch (err) {
//         console.error('Map fetch error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAssets();
//   }, []);

//   // Click handler for map events (zoom to asset)
//   const MapClickHandler = () => {
//     useMapEvents({
//       click: () => { /* Optional: Add new pin */ },
//     });
//     return null;
//   };

//   if (loading) return <div className="flex justify-center items-center min-h-[50vh] text-dark-text">Loading map...</div>;

//   return (
//     <div className="p-6 max-w-full h-screen flex flex-col">
//       <h1 className="text-3xl font-bold mb-4">Track Map</h1>
//       <div className="flex-1 relative">
//         <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }} >
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//           <MapClickHandler />
//           <MarkerClusterGroup>
//             {assets.map((asset) => {
//               const pos = [parseFloat(asset.latitude), parseFloat(asset.longitude)];
//               return (
//                 <Marker key={asset.uid} position={pos} icon={getIcon(asset.condition_lot)}>
//                   <Popup>
//                     <div className="text-center">
//                       <h3 className="font-bold">{asset.uid}</h3>
//                       <p>Vendor: {asset.vendor_name}</p>
//                       <p>Condition: {asset.condition_lot}</p>
//                       <p>Expiry: {asset.warranty_expiry || 'N/A'}</p>
//                       <Link to={`/assets/${asset.uid}`} className="btn-primary text-xs mt-2 block">View Details</Link>
//                     </div>
//                   </Popup>
//                 </Marker>
//               );
//             })}
//           </MarkerClusterGroup>
//         </MapContainer>
//       </div>
//       {/* QR Integration Hook: If from QR, zoom to selectedUid */}
//       {selectedUid && (
//         <button onClick={() => {/* Find asset by uid, flyTo pos */ }} className="btn-primary mt-2">
//           Zoom to QR Asset
//         </button>
//       )}
//     </div>
//   );
// };

// export default TrackMap;

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
          <Link to="/map" state={{ uid: item.uid }} className="btn-primary bg-green-600 hover:bg-green-700">Trace Fitting</Link>
          <Link to="/" className="btn-secondary">Back</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: 'PL Number', value: item.pl_number },
          { label: 'Item Type', value: item.asset_type },
          { label: 'Vendor Code', value: item.vendor_code },
          { label: 'Vendor Name', value: item.vendor_name }
        ].map(({ label, value }) => (
          <Tilt key={label} options={{ max: 15, scale: 1.02 }}>
            <div className="bg-dark-surface p-4 rounded-lg shadow cursor-grab active:cursor-grabbing">
              <h3 className="font-semibold text-dark-muted">{label}</h3>
              <p className="text-xl font-bold text-dark-text">{value || 'N/A'}</p>
            </div>
          </Tilt>
        ))}
        <Tilt>
          <div className={`bg-dark-surface p-4 rounded-lg shadow cursor-grab active:cursor-grabbing ${
            assemblyRemark.status === 'ok' ? 'border-l-4 border-green-500' :
            assemblyRemark.status === 'warning' ? 'border-l-4 border-yellow-500' : 'border-l-4 border-red-500'
          }`}>
            <h3 className="font-bold mb-2">Assembly Remark</h3>
            <p className={`text-lg font-semibold ${
              assemblyRemark.status === 'ok' ? 'text-green-500' :
              assemblyRemark.status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`}>
              {assemblyRemark.remark || 'N/A'}
            </p>
            <p className="text-dark-muted font-medium">{assemblyRemark.reason || 'No remark'}</p>
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
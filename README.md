# Railway-Track-Assessment-System-

License: MIT
React
Node.js
MySQL
RAMS is a full-stack web application designed to revolutionize railway asset tracking and maintenance, inspired by challenges in Indian Railways (IR) infrastructure. It enables field teams to manage rail fittings (sleepers, railpads, liners) efficiently— from CRUD operations and AI-driven predictions to geo-tracing via QR scans and interactive maps. Built for scalability, it's deployable on platforms like Railway or Heroku, with a focus on proactive maintenance to reduce downtime by up to 80%.
This project was developed as a submission for Smart India Hackathon (SIH) 2025 but didn't make the grand finale—still, it's a production-ready.

✨ Features......

Secure Authentication: JWT-based login/register for multi-user teams (bcrypt hashing).
Asset Dashboard: Real-time stats (total/good/repair/expiring), searchable/filterable tables by UID, vendor, condition.
Asset Details & Editing: View/edit conditions, remarks, inspections— with GPS capture for lat/long (browser API + manual entry).
AI Insights & Reports:
Rule-based assembly remarks ("Ready/Not Ready").
Vendor/inventory breakdowns with Chart.js visualizations.
Fittings predictor: Input line km + gauge (BG/MG/NG) → Output sleepers/railpads/liners via Python ML integration.

Geo-Location Tracking:
"Trace Fitting" button in details → Zooms map to exact UID location.
Interactive Leaflet maps with colored pins (green=Good, red=Critical), clustering for 1000+ assets, and UID search/filter.

Alerts & QR Integration: Cron-scheduled warranty expiry notifications; QR gen for UIDs (scan → fetch/trace).
Responsive UI: Dark theme (Tailwind), animations (Tilt/Framer Motion), mobile PWA-ready for offline field use.

🛠 Tech Stack.......

Backend: Node.js/Express, MySQL (pooled queries), JWT (auth), bcrypt, cron (alerts), qrcode, child_process (Python spawn)
Frontend: React 18 (hooks/context), Vite (build tool), Tailwind CSS, React Router (protected routes), Axios (API)
Maps & Viz: Leaflet + react-leaflet (clustering), Chart.js + react-chartjs-2
Extras: Nodemailer (emails), env vars (dev/prod), CORS proxy
Deployment: Railway/Heroku (backend), Vercel/Netlify (frontend)



















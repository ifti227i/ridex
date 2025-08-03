import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import RideService from "../Services/RideService";
import "../styles/Home.css";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix Leaflet default icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Home() {
  // State variables for form inputs
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("Now");
  const [rides, setRides] = useState([]);

  // Refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const routingControlRef = useRef(null);

  // Dummy locations for demonstration
  const dummyLocations = {
    "Airport": [23.8513, 90.4061],
    "Dhanmondi": [23.7461, 90.3742],
    "Gulshan": [23.7925, 90.4078],
    "Uttara": [23.8759, 90.3795],
    "Banani": [23.7937, 90.4066]
  };

  // Fetch available rides
  useEffect(() => {
    RideService
      .getAvailableRides()
      .then(data => {
        console.log(data)
        setRides(data)
      })
      .catch((err) => console.log(err))
  }, []);

  // Initialize map with routing control
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView([23.8103, 90.4125], 13);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Custom icons for pickup and dropoff
      const pickupIcon = L.divIcon({
        html: '<div style="background-color: #4CAF50; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
        className: 'custom-div-icon',
        iconSize: [20, 20]
      });

      const dropoffIcon = L.divIcon({
        html: '<div style="background-color: #f44336; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
        className: 'custom-div-icon',
        iconSize: [20, 20]
      });

      // Initial points
      const startPoint = dummyLocations["Airport"];
      const endPoint = dummyLocations["Gulshan"];

      // Add initial markers
      pickupMarkerRef.current = L.marker(startPoint, { icon: pickupIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('Pickup: Airport');

      dropoffMarkerRef.current = L.marker(endPoint, { icon: dropoffIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup('Dropoff: Gulshan');

      // Initialize routing control with OSRM demo server
      routingControlRef.current = L.Routing.control({
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving'
        }),
        waypoints: [
          L.latLng(startPoint[0], startPoint[1]),
          L.latLng(endPoint[0], endPoint[1])
        ],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        lineOptions: {
          styles: [{ color: 'black', opacity: 0.8, weight: 4 }]
        },
        show: false, // Don't show the instruction panel
        collapsible: true
      });

      // Add routing control to map after a small delay
      setTimeout(() => {
        if (mapInstanceRef.current) {
          routingControlRef.current.addTo(mapInstanceRef.current);
        }
      }, 100);

    } catch (error) {
      console.error('Map initialization error:', error);
    }

    // Cleanup function
    return () => {
      try {
        if (pickupMarkerRef.current) {
          pickupMarkerRef.current.remove();
        }
        if (dropoffMarkerRef.current) {
          dropoffMarkerRef.current.remove();
        }
        if (routingControlRef.current && routingControlRef.current._container) {
          routingControlRef.current.remove();
        }
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }
      } catch (error) {
        console.warn('Cleanup error:', error);
      }

      // Reset all refs
      mapInstanceRef.current = null;
      pickupMarkerRef.current = null;
      dropoffMarkerRef.current = null;
      routingControlRef.current = null;
    };
  }, []);

  const handlePickupChange = (e) => {
    setPickup(e.target.value);
    updateRoute();
  };

  const handleDropoffChange = (e) => {
    setDropoff(e.target.value);
    updateRoute();
  };

  const updateRoute = () => {
    if (!mapInstanceRef.current || !pickup || !dropoff) return;

    const pickupCoords = dummyLocations[pickup];
    const dropoffCoords = dummyLocations[dropoff];

    if (!pickupCoords || !dropoffCoords) return;

    try {
      // Update markers
      if (pickupMarkerRef.current) {
        pickupMarkerRef.current.setLatLng(pickupCoords);
        pickupMarkerRef.current.bindPopup(`Pickup: ${pickup}`);
      }

      if (dropoffMarkerRef.current) {
        dropoffMarkerRef.current.setLatLng(dropoffCoords);
        dropoffMarkerRef.current.bindPopup(`Dropoff: ${dropoff}`);
      }

      // Update route
      if (routingControlRef.current) {
        routingControlRef.current.setWaypoints([
          L.latLng(pickupCoords[0], pickupCoords[1]),
          L.latLng(dropoffCoords[0], dropoffCoords[1])
        ]);
      }

      // Fit bounds to show both markers
      const bounds = L.latLngBounds([pickupCoords, dropoffCoords]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });

    } catch (error) {
      console.error('Route update error:', error);
    }
  };

  return (
    <div className="home-container">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="logo">RideShareX</div>
        <div className="nav-links">
          <Link to="/">Drive</Link>
          <Link to="/">Business</Link>
          <Link to="/">Eats</Link>
          <Link to="/">About</Link>
        </div>
        <div className="auth-links">
          <Link to="/login">Log in</Link>
          <Link to="/signup" className="signup-btn">Sign up</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <div className="ride-request-container">
          <div className="ride-form">
            <h1>Request a ride</h1>

            <div className="location-inputs">
              <div className="input-group">
                <span className="input-icon pickup-icon">●</span>
                <select value={pickup} onChange={handlePickupChange}>
                  <option value="">Select Pickup Location</option>
                  {Object.keys(dummyLocations).map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <span className="input-icon dropoff-icon">■</span>
                <select value={dropoff} onChange={handleDropoffChange}>
                  <option value="">Select Dropoff Location</option>
                  {Object.keys(dummyLocations).map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="datetime-selector">
              <div className="date-selector">
                <label>Date</label>
                <div className="selector-input">
                  <span className="calendar-icon">📅</span>
                  <select value={date} onChange={(e) => setDate(e.target.value)}>
                    <option>Today</option>
                    <option>Tomorrow</option>
                    <option>Select date</option>
                  </select>
                </div>
              </div>

              <div className="time-selector">
                <label>Time</label>
                <div className="selector-input">
                  <span className="time-icon">⏰</span>
                  <select value={time} onChange={(e) => setTime(e.target.value)}>
                    <option>Now</option>
                    <option>15 minutes</option>
                    <option>30 minutes</option>
                    <option>45 minutes</option>
                    <option>1 hour</option>
                    <option>Select time</option>
                  </select>
                </div>
              </div>
            </div>

            <button className="see-prices-btn">See prices</button>
          </div>

          <div className="map-placeholder">
            <div className="map-container" ref={mapRef}>
              {/* Leaflet will initialize here */}
            </div>
          </div>
        </div>

        {/* Suggestions Section */}
        <div className="suggestions-section">
          <h2>Suggestions</h2>

          <div className="suggestion-cards">
            <div className="suggestion-card">
              <div className="card-content">
                <h3>Ride</h3>
                <p>Get there on demand</p>
              </div>
              <div className="card-icon">🚗</div>
            </div>

            <div className="suggestion-card">
              <div className="card-content">
                <h3>Reserve</h3>
                <p>Plan ahead by the hour</p>
              </div>
              <div className="card-icon">📅</div>
            </div>

            <div className="suggestion-card">
              <div className="card-content">
                <h3>Intercity</h3>
                <p>Travel between cities</p>
              </div>
              <div className="card-icon">🏙️</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

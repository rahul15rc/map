import React, { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'; // Import mapbox-gl
import 'mapbox-gl/dist/mapbox-gl.css'; // Import mapbox-gl CSS
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'; // Import Mapbox Geocoder
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'; // Import Mapbox Geocoder CSS
 
function App() {
  const [distance, setDistance] = useState(null);
 
  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmVlbGdhYmFuaSIsImEiOiJjbHQwMHdjcDUwcXk4MnFwMm5pcmo0Mm1lIn0.Sz-Q3j0U-MprwG5rKYXZqg';
 
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [78.9629, 20.5937], // Center of India
      zoom: 4,
    });
 
    // Add geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    });
 
    map.addControl(geocoder);
 
    // Function to plan route and calculate distance
    function planRoute(coordinates) {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates[0][0]},${coordinates[0][1]};${coordinates[1][0]},${coordinates[1][1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
 
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          const route = data.routes[0].geometry;
          const distance = data.routes[0].distance; // Distance in meters
 
          setDistance((distance / 1000).toFixed(2)); // Set distance state
 
          if (map.getSource('route')) {
            map.getSource('route').setData(route);
          } else {
            map.addLayer({
              id: 'route',
              type: 'line',
              source: {
                type: 'geojson',
                data: route,
              },
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#888',
                'line-width': 6,
              },
            });
          }
 
          // Add start and end markers
          new mapboxgl.Marker().setLngLat(coordinates[0]).addTo(map);
          new mapboxgl.Marker().setLngLat(coordinates[1]).addTo(map);
        });
    }
 
    // Event listener for when a result is selected
    geocoder.on('result', function (ev) {
      const coordinates = [ev.result.geometry.coordinates]; // This will be the end location
 
      // If there's already a start location, plot the route
      if (window.startLocation) {
        coordinates.unshift(window.startLocation);
        planRoute(coordinates);
 
        // Reset startLocation
        window.startLocation = null;
      } else {
        // Set startLocation and wait for end location
        window.startLocation = ev.result.geometry.coordinates;
      }
    });
 
    // Cleanup function
    return () => map.remove();
  }, []); // Run once on component mount
 
  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        {distance && <p>Distance: {distance} km</p>}
      </div>
      <div id="map" style={{ position: 'absolute', top: '50px', bottom: 0, width: '100%' }}></div>
    </>
  );
}
 
export default App;
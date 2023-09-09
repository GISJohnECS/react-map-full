import React, { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import styling
import "../../../App.css";

const LeafletComponent = () => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);

  const [lng] = useState(-97.7431);
  const [lat] = useState(30.2672);
  const [zoom] = useState(2);

  const [data, setData] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [load, loadData] = useState(true);
  
  useEffect(() => {

    const fetchEarthquakeData = async () => {
      const response = await fetch(
        "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
      );
      if (load) {
        const data = await response.json();
        // Set our Data
        setData(data);
        // Tell our code that we don't need to load the data anymore
        loadData(false);
      }
    };

    map.current = L.map(mapContainerRef.current).setView([lat, lng], zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    }).addTo(map.current);

    var earthquakeMarkerOptions = {
      radius: 4,
      fillColor: "#FF0000",
      color: "#FFFFFF",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
  };

    var earthquakeLayer = L.geoJSON(data,{
      pointToLayer: function (feature, latlng) {
        const earthquakeMarker = L.circleMarker(latlng, earthquakeMarkerOptions);
          // Use mouseenter to open the popup
          earthquakeMarker.on("mouseover", function (e) {
            this.bindPopup(`
            <strong>${feature.properties.id}</strong><br><strong>Magnitude:</strong><p>${feature.properties.mag}</p><br><strong>Date:</strong>${new Date(feature.properties.time)}`).openPopup();
          });
        
        // Use mouseleave to close the popup
        earthquakeMarker.on("mouseout", function (e) {
          this.closePopup();
        });

        return earthquakeMarker;
    
      }}).addTo(map.current);

    
    // Fetch our Earthquake GeoJSON data
    map.current.on('load', fetchEarthquakeData());

    return () => {
      map.current.remove();
      earthquakeLayer.remove();
    };
  }, [lat, lng, zoom, data, load]);

  return <div className="map-container" ref={mapContainerRef} />;
};

export default LeafletComponent;

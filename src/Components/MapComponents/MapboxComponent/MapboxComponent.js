import React, {useEffect, useState, useRef} from 'react';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";
import { environment } from '../../../Environments/EnvDev';
import '../../../App.css';

mapboxgl.accessToken = environment.mapbox.accessToken;

const MapboxComponent = () => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);

  const [lng] = useState(-97.7431);
  const [lat] = useState(30.2672);
  const [zoom] = useState(2);

  // Initialize map when component mounts
  useEffect(() => {

    map.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

    // Add our navigation control (the +/- zoom buttons)
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Map onload event 
    map.current.on("load", ()=> {
        // Nifty code to force map to fit inside container when it loads
        map.current.resize();

        map.current.addSource('earthquakes', {
            type: 'geojson',
            // Use a URL for the value for the `data` property.
            data: 'https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson'
          });
          
          map.current.addLayer({
            'id': 'earthquakes-layer',
            'type': 'circle',
            'source': 'earthquakes',
            'paint': {
              'circle-radius': 4,
              'circle-stroke-width': 2,
              'circle-color': 'red',
              'circle-stroke-color': 'white'
            }
          });

          // Create a popup, but don't add it to the map yet.
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        map.current.on('mouseenter', 'earthquakes-layer', (e) => {
            // Change the cursor style as a UI indicator.
            map.current.getCanvas().style.cursor = 'pointer';
             
            // Copy coordinates array.
            const coordinates = e.features[0].geometry.coordinates.slice();
            const properties = e.features[0].properties;

            const popupHtml = `<strong>${properties.id}</strong><br><strong>Magnitude:</strong><p>${properties.mag}</p><br><strong>Date:</strong>${new Date(properties.time)}`
             
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
             
            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(coordinates).setHTML(popupHtml).addTo(map.current);
        });
        
        map.current.on('mouseleave', 'earthquakes-layer', () => {
            map.current.getCanvas().style.cursor = '';
            popup.remove();
        });
    })

    // Clean up on unmount
    return () => map.current.remove();
  }, [lat, lng, zoom]); 

  return (
    <div className='map-container' ref={mapContainerRef} />
  );
};

export default MapboxComponent;

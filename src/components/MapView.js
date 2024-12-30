import "leaflet/dist/leaflet.css";
import "../styles/leaflet.css";
import "../styles/colleagueForm.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { useEffect, useRef } from "react";


function MapView({ position }) {
  const mapRef = useRef();
  const DefaultIcon = L.icon({iconUrl: markerIcon, shadowUrl: markerShadow});
  
  L.Marker.prototype.options.icon = DefaultIcon; // ברירת מחדל 

  useEffect(() => {
    if(mapRef.current){
        mapRef.current.setView(position, 13);
    }
  }, [position]);

  return (
    <MapContainer center={position} zoom={14} ref={mapRef} style={{ height: "400px", width: "100%" }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
        <Marker position={position}>
            <Popup>{`מקום בחירה: ${position[0]}, ${position[1]}`}</Popup>
        </Marker>
    </MapContainer>
  );
}

export default MapView;

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";


interface MapProps {
  position: { lat: number; lng: number };
  setPosition: (pos: { lat: number; lng: number }) => void;
}

function LocationMarker({ position, setPosition }: MapProps) {
  const map = useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      map.setView([e.latlng.lat, e.latlng.lng], map.getZoom());
    },
  });

  return <Marker position={L.latLng(position.lat, position.lng)} />;
}

export default function LeafletMap({ position, setPosition }: MapProps) {
  return (
    <MapContainer
      center={[position.lat, position.lng]}
      zoom={15}
      style={{ width: "100%", height: "400px", marginBottom: "16px" }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attributions={['&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors']}
      />
      <LocationMarker position={position} setPosition={setPosition} />
    </MapContainer>
  );
}

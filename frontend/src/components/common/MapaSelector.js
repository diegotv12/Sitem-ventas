import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Solución para el problema común del icono por defecto de Leaflet con Webpack/React
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });
// Alternativa más simple si los íconos no cargan: definir un ícono custom o usar CDN para imágenes.
// Por ahora, confiaré en que react-leaflet maneje esto o lo ajustaré si los íconos no aparecen.

// Componente para manejar eventos de clic en el mapa y mover el marcador
const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
    const map = useMapEvents({
        click(e) {
            const newPos = e.latlng;
            setPosition(newPos);
            if (onLocationSelect) {
                onLocationSelect(newPos);
            }
            map.flyTo(newPos, map.getZoom()); // Centrar el mapa en el nuevo marcador
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Ubicación seleccionada: <br /> Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}</Popup>
        </Marker>
    );
};

// Componente para recentrar el mapa cuando la posición inicial cambia
const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center && (map.getCenter().lat !== center.lat || map.getCenter().lng !== center.lng)) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};


const MapaSelector = ({ initialPosition, onLocationSelect, height = '400px' }) => {
    // Posición inicial por defecto (ej. centro de una ciudad conocida si no hay initialPosition)
    const defaultInitialPosition = { lat: 20.659698, lng: -103.349609 }; // Guadalajara, MX
    const [markerPosition, setMarkerPosition] = useState(null);
    const mapRef = useRef(null); // Referencia al mapa

    useEffect(() => {
        // Si se proporciona una posición inicial válida, colocar el marcador allí.
        if (initialPosition && typeof initialPosition.lat === 'number' && typeof initialPosition.lng === 'number') {
            setMarkerPosition(initialPosition);
        } else {
            setMarkerPosition(null); // O alguna posición por defecto si se prefiere un marcador siempre visible
        }
    }, [initialPosition]);

    const currentCenter = markerPosition || initialPosition || defaultInitialPosition;

    return (
        <div style={{ height: height, marginBottom: '20px', border: '1px solid #ccc' }}>
            <MapContainer
                center={currentCenter}
                zoom={initialPosition ? 15 : 10} // Zoom más cercano si hay posición inicial
                style={{ height: '100%', width: '100%' }}
                whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    position={markerPosition}
                    setPosition={setMarkerPosition}
                    onLocationSelect={onLocationSelect}
                />
                {/* Componente para asegurar que el mapa se centre si initialPosition cambia */}
                <ChangeView center={currentCenter} zoom={initialPosition ? 15: 10} />
            </MapContainer>
            { !markerPosition && <p style={{textAlign: 'center', padding: '5px'}}>Haz clic en el mapa para seleccionar una ubicación.</p> }
        </div>
    );
};

export default MapaSelector;

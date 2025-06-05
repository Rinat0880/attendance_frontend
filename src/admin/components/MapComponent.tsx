import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useMap } from 'react-leaflet'; 
import 'leaflet/dist/leaflet.css';
import { LatLngTuple } from 'leaflet';
import { IconButton, TextField, Autocomplete, Paper } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SearchIcon from '@mui/icons-material/Search';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

interface SearchResult {
    display_name: string;
    lat: string;
    lon: string;
}

const defaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapComponentProps {
    coordinates: LatLngTuple;
    radius: number;
    onPositionChange: (position: LatLngTuple) => void;
}

// Explicitly marking LocationMarker as using useMap
const LocationMarker: React.FC<MapComponentProps> = ({ coordinates, radius, onPositionChange }) => {
    const markerRef = useRef<L.Marker>(null);
    const circleRef = useRef<L.Circle | null>(null);
    const map = useMap(); // This hook is definitely used

    useEffect(() => {
        if (markerRef.current) {
            markerRef.current.setLatLng(coordinates);
            map.setView(coordinates);
        }

        if (circleRef.current) {
            circleRef.current.remove();
        }

        circleRef.current = L.circle(coordinates, {
            color: "blue",
            fillColor: "lightblue",
            fillOpacity: 0.3,
            radius: radius, 
        }).addTo(map);

        return () => {
            circleRef.current?.remove();
        };
    }, [coordinates, radius, map]);

    return (
        <Marker
            ref={markerRef}
            position={coordinates}
            icon={defaultIcon}
            draggable={true}
            eventHandlers={{
                dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    onPositionChange([position.lat, position.lng]);
                },
            }}
        />
    );
};

const SearchBox: React.FC<{
    onSelectLocation: (lat: number, lon: number) => void;
}> = ({ onSelectLocation }) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    const searchLocation = async (query: string) => {
        if (!query) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
            );
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Error searching location:', error);
            setSearchResults([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            searchLocation(searchQuery);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <Autocomplete
            freeSolo
            options={searchResults}
            getOptionLabel={(option) => 
                typeof option === 'string' ? option : option.display_name
            }
            loading={loading}
            style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: '300px',
            }}
            renderInput={(params) => (
                <Paper elevation={3}>
                    <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder="Search location..."
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            ...params.InputProps,
                            startAdornment: <SearchIcon />,
                            style: { 
                                backgroundColor: 'white',
                                borderRadius: '4px',
                            }
                        }}
                    />
                </Paper>
            )}
            onChange={(event, value) => {
                if (value && typeof value !== 'string') {
                    onSelectLocation(parseFloat(value.lat), parseFloat(value.lon));
                }
            }}
        />
    );
};

const MapComponent: React.FC<MapComponentProps> = ({ coordinates, radius, onPositionChange }) => {
    const mapRef = useRef<L.Map>(null);

    const handleMyLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPosition: LatLngTuple = [
                        position.coords.latitude,
                        position.coords.longitude
                    ];
                    onPositionChange(newPosition);
                    mapRef.current?.setView(newPosition, 13);
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your location. Please check your browser settings.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser');
        }
    };

    const handleSearchSelect = (lat: number, lon: number) => {
        const newPosition: LatLngTuple = [lat, lon];
        onPositionChange(newPosition);
        mapRef.current?.setView(newPosition, 13);
    };

    return (
        <div style={{ position: 'relative', height: '100%' }}>
            <MapContainer
                center={coordinates}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker coordinates={coordinates} onPositionChange={onPositionChange} radius={radius} />
            </MapContainer>
            <SearchBox onSelectLocation={handleSearchSelect} />
            <IconButton
                onClick={handleMyLocation}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 1000,
                    backgroundColor: 'white',
                }}
            >
                <MyLocationIcon />
            </IconButton>
        </div>
    );
};

export default MapComponent;
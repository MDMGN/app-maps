import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import MapView, { Geojson, Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";

type Coord = {
  latitude: number;
  longitude: number;
};

export default function App() {
  const [location, setLocation] = useState<Coord | null>(null);
  const [address, setAddress] = useState("");
  const [route, setRoute] = useState<Coord[]>([]);
  const currentLocation = useRef<Coord | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const myPlace = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [64.165329, 48.844287],
        },
      },
    ],
  };
  // Obtener ubicación inicial
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso de ubicación denegado");
        return;
      }
      const current = await Location.getCurrentPositionAsync();
      currentLocation.current = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setLocation(currentLocation.current);
    })();
  }, []);

  // ... imports como antes

  // NUEVO: función para obtener ruta desde OSRM
  async function fetchRouteFromOSRM(from: Coord, to: Coord): Promise<Coord[]> {
    const url = `https://routing.openstreetmap.de/routed-foot/route/v1/walking/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

    if (!data.routes || data.routes.length === 0) {
      throw new Error("Ruta no encontrada");
    }

    const coordinates = data.routes[0].geometry.coordinates;
    return coordinates.map(([lon, lat]: [number, number]) => ({
      latitude: lat,
      longitude: lon,
    }));
  }

  // Dentro del componente App
  const handleGeoCode = async () => {
    if (!address.trim()) return;

    const result = await Location.geocodeAsync(address.trim());
    if (result.length === 0) {
      Alert.alert("Dirección no encontrada");
      return;
    }

    const { latitude, longitude } = result[0];
    const to = { latitude, longitude };
    const from = currentLocation.current;

    if (from) {
      try {
        const fullRoute = await fetchRouteFromOSRM(from, to);
        setRoute(fullRoute);
      } catch (err) {
        Alert.alert("No se pudo obtener la ruta");
      }
    }

    setLocation(to);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa una dirección"
          onChangeText={setAddress}
          value={address}
        />
        <Button title="Buscar" onPress={handleGeoCode} />
      </View>

      {location ? (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={{
            ...location,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          onPress={(event) => {
            const coords = event.nativeEvent.coordinate;
            console.log({ coords });
          }}
        >
          <Marker coordinate={location} title="Ubicación actual" />
          {route.length > 0 && (
            <>
              <Polyline
                coordinates={route}
                strokeColor="#1e90ff"
                strokeWidth={4}
              />
              <Marker coordinate={route[0]} title="Inicio" />
              <Marker coordinate={route[route.length - 1]} title="Fin" />
            </>
          )}
        </MapView>
      ) : (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Cargando mapa...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingBottom: 50,
    paddingTop: 50,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

# Proyecto de Mapa con React Native + Expo + TypeScript

Este proyecto es una aplicación móvil creada con **React Native** utilizando **Expo** y **TypeScript**. Utiliza la librería **`react-native-maps`** para integrar mapas interactivos en la app.

---

## Tecnologías utilizadas

- **React Native**: Framework para crear aplicaciones móviles nativas.
- **Expo**: Herramienta para facilitar el desarrollo con React Native.
- **TypeScript**: Lenguaje de programación con tipado estático.
- **`react-native-maps`**: Librería para mostrar mapas en aplicaciones móviles.
- **Google Maps / Apple Maps**: Mapas proporcionados por Google y Apple.
- **Expo Location**: API de Expo para obtener la ubicación del usuario.

---

## Instalación

Sigue estos pasos para comenzar a trabajar con el proyecto.

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu_usuario/proyecto-mapas.git
cd proyecto-mapas
```

### 2. Instalar las dependencias

```bash
npx expo install react-native-maps
```

Si estás utilizando **Expo Go**, esto será suficiente para que los mapas funcionen con Apple Maps en iOS y Google Maps en Android (modo limitado).

---

## Configuración para Google Maps (si usas EAS Build)

Si deseas usar **Google Maps** con la clave de API, necesitas configurar el archivo `app.json` para **EAS Build**:

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) y obtiene una **API Key**.
2. Habilita las siguientes APIs:

   - Maps SDK for Android
   - Geocoding API
   - Directions API (opcional)

3. Agrega la clave API en tu `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "config": {
            "googleMaps": {
              "apiKey": "TU_API_KEY_AQUI"
            }
          }
        }
      ]
    ],
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "TU_API_KEY_AQUI"
        }
      }
    }
  }
}
```

> **Nota**: Este paso solo se aplica si usas **EAS Build**.

---

## Ejemplo de uso

### 1. **Mostrar un mapa básico con tu ubicación**

```tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import * as Location from "expo-location";

const App = () => {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permisos denegados");
        return;
      }
      const location = await Location.getCurrentPositionAsync();
      setLocation(location.coords);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          provider={PROVIDER_GOOGLE} // Esto configura Google Maps
          style={styles.map}
          region={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Tu ubicación"
          />
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text>Cargando ubicación...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
```

### 2. **Geocodificación: Convertir una dirección en coordenadas**

```tsx
import React, { useState } from "react";
import { TextInput, Button, Alert, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";

const GeocodeApp = () => {
  const [address, setAddress] = useState<string>("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleGeocode = async () => {
    if (!address) return;
    const result = await Location.geocodeAsync(address);

    if (result.length === 0) {
      Alert.alert("No se encontró la dirección");
      return;
    }

    const { latitude, longitude } = result[0];
    setLocation({ latitude, longitude });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Ingresa una dirección"
        onChangeText={setAddress}
        value={address}
      />
      <Button title="Buscar" onPress={handleGeocode} />
      {location && (
        <Text>
          Coordenadas: {location.latitude}, {location.longitude}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default GeocodeApp;
```

---

## Ejercicios prácticos

### 1. **Mostrar un mapa con múltiples marcadores**

- Agrega varios **`Marker`** en el mapa usando un array de coordenadas predefinidas o una lista de ubicaciones.

### 2. **Implementar la funcionalidad de rutas**

- Usando la API de **OSRM**, muestra una ruta entre dos puntos en el mapa.
- API: https://router.project-osrm.org/route/v1/driving/{from.longitude},{from.latitude};{to.longitude},{to.latitude}?overview=full&geometries=geojson

### 3. **Crear una app de ubicación en tiempo real**

- Usa **`Location.watchPositionAsync`** para rastrear y actualizar la ubicación del usuario en tiempo real.

### 4. **Agregar búsqueda de lugar**

- Implementa un **autocomplete de lugares** usando la API de **nominatim** .

API: https://nominatim.openstreetmap.org/search?q={place}&format=json

### 5: Personalización del mapa y Guardado de Marcadores al Tocar el Mapa

En este ejercicio, aprenderás a personalizar un mapa y agregar marcadores dinámicamente. Los usuarios podrán tocar el mapa para agregar puntos de interés, y estos puntos se guardarán en un array y se mostrarán como marcadores en el mapa. (Usa el evento onPress de MApView)

---

## Enlaces útiles

1. [Documentación oficial de react-native-maps](https://github.com/react-native-maps/react-native-maps)
2. [Expo - Location API](https://docs.expo.dev/versions/latest/sdk/location/)
3. [Google Cloud Platform - API Keys](https://cloud.google.com/maps-platform)
4. [Mapas en Expo](https://docs.expo.dev/versions/latest/sdk/maps/)

---

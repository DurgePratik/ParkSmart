import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useNavigation, useRouter } from "expo-router";

import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import polyline from "@mapbox/polyline";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY!;

type Coord = {
  latitude: number;
  longitude: number;
};

type ParkingSpot = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

export default function BookingPage() {
  const navigation = useNavigation();
  const router = useRouter();

  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<Coord | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [routeCoords, setRouteCoords] = useState<Coord[]>([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  async function getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permission Required", "Location permission is required.");
        setLoading(false);
        return;
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      const userLocation = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };

      setLocation(userLocation);

      await fetchParkingSpots(userLocation);

      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  }

  async function fetchParkingSpots(loc: Coord) {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
        `?location=${loc.latitude},${loc.longitude}` +
        `&radius=5000&type=parking` +
        `&key=${GOOGLE_MAPS_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      console.log("========== GOOGLE PLACES ==========");
      console.log(data);

      if (data.status !== "OK") {
        console.log("Places Error:", data.error_message);
        return;
      }

      const spots: ParkingSpot[] = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      }));

      console.log("Parking Spots:", spots);

      setParkingSpots(spots);

      setTimeout(() => {
        if (mapRef.current && spots.length > 0) {
          mapRef.current.fitToCoordinates(
            spots.map((spot) => ({
              latitude: spot.latitude,
              longitude: spot.longitude,
            })),
            {
              edgePadding: {
                top: 100,
                bottom: 100,
                left: 100,
                right: 100,
              },
              animated: true,
            },
          );
        }
      }, 1000);
    } catch (err) {
      console.log("Places Error:", err);
    }
  }

  async function fetchRoute(destination: ParkingSpot) {
    if (!location) return;

    try {
      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${location.latitude},${location.longitude}` +
        `&destination=${destination.latitude},${destination.longitude}` +
        `&key=${GOOGLE_MAPS_API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.routes.length > 0) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);

        const coords = points.map(([lat, lng]: number[]) => ({
          latitude: lat,
          longitude: lng,
        }));

        setRouteCoords(coords);

        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: {
            top: 120,
            bottom: 250,
            left: 70,
            right: 70,
          },
          animated: true,
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  function handleMarkerPress(spot: ParkingSpot) {
    setSelectedSpot(spot);
    fetchRoute(spot);
  }

  function recenterMap() {
    if (!location) return;

    mapRef.current?.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      600,
    );
  }

  if (loading || !location) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {parkingSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{
              latitude: spot.latitude,
              longitude: spot.longitude,
            }}
            title={spot.name}
            pinColor={selectedSpot?.id === spot.id ? "#2563EB" : "#22C55E"}
            onPress={() => handleMarkerPress(spot)}
          />
        ))}

        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={5}
            strokeColor="#2563EB"
          />
        )}
      </MapView>

      <TouchableOpacity style={styles.locationButton} onPress={recenterMap}>
        <Ionicons name="locate" size={24} color="#2563EB" />
      </TouchableOpacity>

      {selectedSpot && (
        <View style={styles.bottomCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{selectedSpot.name}</Text>

            <Text style={styles.subtitle}>Parking Available</Text>

            <Text style={styles.price}>₹50 / hour</Text>
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() =>
              router.push({
                pathname: "/payment",
                params: {
                  spotId: selectedSpot.id,
                  spotName: selectedSpot.name,
                  amount: "50",
                  latitude: selectedSpot.latitude.toString(),
                  longitude: selectedSpot.longitude.toString(),
                },
              })
            }
          >
            <Text style={styles.bookText}>Book Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  map: {
    flex: 1,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  locationButton: {
    position: "absolute",
    right: 20,
    bottom: 180,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 8,
  },

  bottomCard: {
    position: "absolute",
    left: 15,
    right: 15,
    bottom: 20,

    backgroundColor: "#fff",

    borderRadius: 20,

    padding: 18,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748B",
  },

  price: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
  },

  bookButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
  },

  bookText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});

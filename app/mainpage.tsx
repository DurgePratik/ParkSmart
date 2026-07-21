import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../firebaseConfig";
import { logout } from "../services/auth";

export default function MainPage() {
  const router = useRouter();
  const navigation = useNavigation();

  const user = auth.currentUser;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch {
      Alert.alert("Logout Failed", "Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}

        <View style={styles.profileSection}>
          <Image
            source={{
              uri: user?.photoURL || "https://ui-avatars.com/api/?name=User",
            }}
            style={styles.avatar}
          />

          <Text style={styles.greeting}>Welcome Back 👋</Text>

          <Text style={styles.name}>
            {user?.displayName || "ParkSmart User"}
          </Text>

          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Find Parking */}

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => router.push("/bookingpage")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="car-sport" size={28} color="#2563EB" />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Find Parking</Text>

            <Text style={styles.cardDescription}>
              Locate nearby parking spaces with real-time availability.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>

        {/* Booking History */}

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => router.push("/paymenthistory")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="time" size={28} color="#22C55E" />
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Booking History</Text>

            <Text style={styles.cardDescription}>
              View your previous bookings, receipts and payments.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
        </TouchableOpacity>

        {/* Logout */}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />

          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1220",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },

  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    marginBottom: 20,
  },

  greeting: {
    fontSize: 18,
    color: "#CBD5E1",
    marginBottom: 8,
  },

  name: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },

  email: {
    fontSize: 15,
    color: "#94A3B8",
    marginTop: 8,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 6,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  cardContent: {
    flex: 1,
    marginLeft: 18,
    marginRight: 10,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },

  cardDescription: {
    marginTop: 6,
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },

  logoutButton: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: "600",
    color: "#EF4444",
  },
});

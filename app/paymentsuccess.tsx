import React from "react";
import {
    Linking,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PaymentSuccessPage() {
  const router = useRouter();

  const { spotName, amount, latitude, longitude } = useLocalSearchParams();

  const startNavigation = async () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    try {
      await Linking.openURL(url);
    } catch {
      alert("Unable to open Google Maps.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={110} color="#22C55E" />
        </View>

        <Text style={styles.title}>Payment Successful</Text>

        <Text style={styles.subtitle}>
          Your parking has been booked successfully.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Parking Spot</Text>
            <Text style={styles.value}>{spotName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Amount Paid</Text>
            <Text style={styles.amount}>₹{amount}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startNavigation}
        >
          <Ionicons name="navigate" size={20} color="white" />
          <Text style={styles.primaryText}>Start Navigation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/paymenthistory")}
        >
          <Ionicons name="receipt-outline" size={20} color="#2563EB" />
          <Text style={styles.secondaryText}>Payment History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.replace("/bookingpage")}
        >
          <Ionicons name="home-outline" size={20} color="#2563EB" />
          <Text style={styles.secondaryText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  iconContainer: {
    marginBottom: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 35,
  },

  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 20,
    elevation: 6,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    marginBottom: 35,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 15,
  },

  label: {
    fontSize: 16,
    color: "#6B7280",
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    textAlign: "right",
  },

  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22C55E",
  },

  primaryButton: {
    width: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 15,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 15,
  },

  primaryText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },

  secondaryButton: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 15,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 15,

    borderWidth: 1,
    borderColor: "#2563EB",
  },

  secondaryText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
});

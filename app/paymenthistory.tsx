import { useNavigation } from "expo-router";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

import { auth, db } from "../firebaseConfig";

type Payment = {
  id: string;
  uid: string;
  email: string;
  spotId: string;
  spotName: string;
  amount: string;
  paymentId: string;
  orderId: string;
  bookingTime: string;
  status: string;
};

export default function PaymentHistory() {
  const navigation = useNavigation();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  async function fetchPayments() {
    try {
      const user = auth.currentUser;

      console.log("Current User:", user?.email);
      console.log("Current UID:", user?.uid);

      if (!user) {
        setPayments([]);
        return;
      }

      const q = query(
        collection(db, "payments"),
        where("uid", "==", user.uid),
        orderBy("bookingTime", "desc"),
      );

      const snapshot = await getDocs(q);

      console.log("Documents Found:", snapshot.size);

      snapshot.forEach((doc) => {
        console.log(doc.id, doc.data());
      });

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Payment, "id">),
      }));

      setPayments(data);
    } catch (err) {
      console.error("Firestore Query Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchPayments();
  }, []);

  function onRefresh() {
    setRefreshing(true);
    fetchPayments();
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Payment History</Text>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>

          <Text style={styles.emptySubtitle}>
            Your completed parking bookings will appear here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{
            paddingBottom: 30,
          }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.spotName}>{item.spotName}</Text>

                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>

              <Text style={styles.amount}>₹ {item.amount}</Text>

              <Text style={styles.date}>
                {new Date(item.bookingTime).toLocaleString()}
              </Text>

              <Text style={styles.paymentId}>Payment ID</Text>

              <Text style={styles.paymentValue}>{item.paymentId}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 18,
    paddingTop: 20,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  heading: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 20,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
  },

  emptySubtitle: {
    marginTop: 10,
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  spotName: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginRight: 10,
  },

  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    color: "#15803D",
    fontWeight: "700",
    fontSize: 13,
  },

  amount: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: "700",
    color: "#2563EB",
  },

  date: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 14,
  },

  paymentId: {
    marginTop: 18,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
  },

  paymentValue: {
    marginTop: 4,
    color: "#334155",
    fontSize: 13,
  },
});

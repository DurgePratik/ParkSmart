import React, { useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, View } from "react-native";

import { WebView } from "react-native-webview";

import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";

import { auth } from "../firebaseConfig";

const BACKEND_URL = "http://192.168.41.118:5000";

export default function PaymentPage() {
  const navigation = useNavigation();
  const router = useRouter();

  const { spotId, spotName, amount, latitude, longitude } =
    useLocalSearchParams();

  const [orderId, setOrderId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [loadingWebView, setLoadingWebView] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  useEffect(() => {
    createOrder();
  }, []);

  async function createOrder() {
    try {
      const response = await fetch(`${BACKEND_URL}/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
        }),
      });

      const data = await response.json();

      setOrderId(data.id);
    } catch (err) {
      console.log(err);

      Alert.alert("Payment Error", "Unable to create order.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePaymentSuccess(paymentData: any) {
    try {
      const user = auth.currentUser;

      await fetch(`${BACKEND_URL}/payment-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user?.uid,
          email: user?.email,

          spotId,
          spotName,

          amount,

          paymentId: paymentData.razorpay_payment_id,

          orderId: paymentData.razorpay_order_id,

          signature: paymentData.razorpay_signature,

          bookingTime: new Date().toISOString(),
        }),
      });

      router.replace({
        pathname: "/paymentsuccess",
        params: {
          spotName,
          amount,
          latitude,
          longitude,
        },
      });
    } catch (err) {
      console.log(err);

      Alert.alert("Error", "Failed to save booking.");
    }
  }

  if (loading || !orderId) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const htmlContent = `
  <html>
    <head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />

      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </head>

    <body>

      <script>

        var options = {

          key: "rzp_test_Eb20fMVM3hFoPE",

          amount: "${Number(amount) * 100}",

          currency: "INR",

          name: "ParkSmart",

          description: "Parking Booking",

          order_id: "${orderId}",

          theme: {
            color: "#2563EB"
          },

          handler: function(response){

            window.ReactNativeWebView.postMessage(
              JSON.stringify(response)
            );

          },

          modal: {

            ondismiss: function(){

              window.ReactNativeWebView.postMessage(
                JSON.stringify({
                  status:"dismissed"
                })
              );

            }

          }

        };

        var rzp = new Razorpay(options);

        rzp.open();

      </script>

    </body>

  </html>
  `;

  return (
    <View style={styles.container}>
      {loadingWebView && (
        <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
      )}

      <WebView
        originWhitelist={["*"]}
        source={{
          html: htmlContent,
        }}
        onLoadStart={() => setLoadingWebView(true)}
        onLoadEnd={() => setLoadingWebView(false)}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);

          if (data.razorpay_payment_id) {
            handlePaymentSuccess(data);
          } else if (data.status === "dismissed") {
            router.back();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -20,
    zIndex: 100,
  },
});

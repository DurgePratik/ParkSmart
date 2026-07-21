import { useNavigation, useRouter } from "expo-router";
import React, { useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signInWithGoogle } from "../services/auth";

export default function Login() {
  const router = useRouter();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const user = await signInWithGoogle();

      console.log("Logged in:", user.email);

      router.replace("/mainpage");
    } catch (error: any) {
      console.error(error);

      Alert.alert(
        "Login Failed",
        error?.message || "Unable to sign in with Google.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.title}>ParkSmart</Text>

        <Text style={styles.subtitle}>Smart Parking Made Simple</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Continue with Google</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  title: {
    color: "white",
    fontSize: 38,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    color: "#CBD5E1",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 60,
  },

  button: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

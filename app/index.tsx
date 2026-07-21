import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import { auth } from "../firebaseConfig";

export default function Index() {
  const router = useRouter();

  const carX = useRef(new Animated.Value(-220)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const smokeOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(smokeOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),

        Animated.timing(smokeOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.sequence([
      Animated.timing(carX, {
        toValue: 250,
        duration: 2200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),

      Animated.delay(700),

      Animated.timing(carX, {
        toValue: 520,
        duration: 900,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      const user = auth.currentUser;

      if (user) {
        router.replace("/mainpage");
      } else {
        router.replace("/login");
      }
    });
  }, []);
  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleOpacity,
          },
        ]}
      >
        ParkSmart
      </Animated.Text>

      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: subtitleOpacity,
          },
        ]}
      >
        Finding Parking...
      </Animated.Text>

      <View style={styles.animationArea}>
        <Animated.View
          style={[
            styles.carContainer,
            {
              transform: [{ translateX: carX }],
            },
          ]}
        >
          <Animated.Image
            source={require("../assets/smoke.png")}
            resizeMode="contain"
            style={[
              styles.smoke,
              {
                opacity: smokeOpacity,
              },
            ]}
          />

          <Image
            source={require("../assets/car.png")}
            resizeMode="contain"
            style={styles.car}
          />
        </Animated.View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#2563EB",
    letterSpacing: 1,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 17,
    color: "#6B7280",
    marginBottom: 70,
  },

  animationArea: {
    width: "100%",
    height: 180,
    justifyContent: "center",
    overflow: "hidden",
  },

  carContainer: {
    position: "absolute",
    left: -220,
    flexDirection: "row",
    alignItems: "center",
  },

  smoke: {
    width: 65,
    height: 40,
    marginRight: -12,
    opacity: 0.7,
  },

  car: {
    width: 220,
    height: 120,
    marginLeft: 6,
  },
});

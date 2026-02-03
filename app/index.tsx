import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(console.warn);

export default function SplashScreenComponent() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const translateY = useSharedValue(50);

  useEffect(() => {
    // Start animations
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    translateY.value = withTiming(0, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });

    // Navigate to main app after delay
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      router.replace("/(tabs)");
    }, 2500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>💼</Text>
        </View>
        <Text style={styles.title}>Job Hunting</Text>
        <Text style={styles.subtitle}>Find Your Dream Remote Job</Text>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>BSUIR Mobile Development</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a7ea4",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 50,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
  },
});

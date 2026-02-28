import { useLocalization } from "@/contexts/LocalizationContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

export function NetworkBanner() {
  const { isConnected } = useNetworkStatus();
  const { t } = useLocalization();
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prevConnected = useRef<boolean | null>(null);

  useEffect(() => {
    if (prevConnected.current === null) {
      prevConnected.current = isConnected;
      return;
    }

    const changed = prevConnected.current !== isConnected;
    prevConnected.current = isConnected;
    if (!changed) return;

    if (hideTimer.current) clearTimeout(hideTimer.current);

    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    hideTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, 8000);

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isConnected]);

  const backgroundColor = isConnected ? "#22C55E" : "#EF4444";
  const icon = isConnected ? "wifi" : "wifi-outline";
  const message = isConnected ? t("network.restored") : t("network.offline");

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Ionicons name={icon as any} size={18} color="#fff" style={styles.icon} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    paddingTop: 44,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

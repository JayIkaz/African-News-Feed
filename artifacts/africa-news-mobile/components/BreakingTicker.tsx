import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View, Platform } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Article } from "@workspace/api-client-react";

interface BreakingTickerProps {
  articles: Article[];
}

export function BreakingTicker({ articles }: BreakingTickerProps) {
  const colors = useColors();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (articles.length <= 1) return;

    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -10,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
        slideAnim.setValue(10);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [articles.length, fadeAnim, slideAnim]);

  if (articles.length === 0) return null;

  const current = articles[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>BREAKING</Text>
      </View>
      <Animated.View
        style={[
          styles.textContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text
          style={[styles.headline, { color: colors.primaryForeground }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {current?.title ?? ""}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 36,
    paddingHorizontal: 12,
    overflow: "hidden",
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 10,
    flexShrink: 0,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 1,
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif-medium",
  },
  textContainer: {
    flex: 1,
    overflow: "hidden",
  },
  headline: {
    fontSize: 13,
    fontWeight: "500" as const,
    letterSpacing: 0.1,
  },
});

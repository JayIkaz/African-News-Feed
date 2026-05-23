import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/useColors";
import { Article } from "@workspace/api-client-react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH;

interface TopStoryCarouselProps {
  articles: Article[];
}

interface CarouselItemProps {
  article: Article;
  onPress: () => void;
}

function CarouselItem({ article, onPress }: CarouselItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <Image
        source={
          article.imageUrl
            ? { uri: article.imageUrl }
            : require("@/assets/images/icon.png")
        }
        style={styles.image}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.82)"]}
        style={styles.gradient}
      />
      <View style={styles.overlay}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: colors.primary },
          ]}
        >
          <Text style={styles.categoryText}>
            {article.category.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={3}>
          {article.title}
        </Text>
        <Text style={styles.meta}>
          {article.sourceName} · {article.country}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function TopStoryCarousel({ articles }: TopStoryCarouselProps) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  if (articles.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={articles}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CarouselItem
            article={item}
            onPress={() => router.push(`/article/${item.id}`)}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToAlignment="start"
        decelerationRate="fast"
        scrollEnabled={!!articles.length}
      />
      <View style={styles.dotsContainer}>
        {articles.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor:
                  i === activeIndex
                    ? colors.primaryForeground
                    : "rgba(255,255,255,0.4)",
                width: i === activeIndex ? 16 : 6,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    position: "relative",
  },
  card: {
    width: CARD_WIDTH,
    height: 280,
    backgroundColor: "#1a1a1a",
  },
  image: {
    width: CARD_WIDTH,
    height: 280,
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 36,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    marginBottom: 8,
  },
  categoryText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
  },
  title: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700" as const,
    lineHeight: 26,
    marginBottom: 6,
    fontFamily: "Lora_700Bold",
  },
  meta: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "400" as const,
  },
  dotsContainer: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});

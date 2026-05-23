import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useGetTopStories,
  useGetTrendingArticles,
  useListArticles,
  Article,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { BreakingTicker } from "@/components/BreakingTicker";
import { TopStoryCarousel } from "@/components/TopStoryCarousel";
import { CategoryTabs } from "@/components/CategoryTabs";
import { ArticleCard } from "@/components/ArticleCard";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const topStories = useGetTopStories({ limit: 6 });
  const trending = useGetTrendingArticles({ limit: 8 });

  const categoryParam =
    selectedCategory !== "All" ? selectedCategory : undefined;

  const articles = useListArticles({ category: categoryParam, limit: 30 });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      topStories.refetch(),
      trending.refetch(),
      articles.refetch(),
    ]);
    setRefreshing(false);
  };

  const HEADER_H = 44;
  const TICKER_H = 36;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const ListHeader = (
    <View>
      <View style={{ height: topPad + HEADER_H + TICKER_H }} />
      <TopStoryCarousel articles={topStories.data?.articles ?? []} />
      <CategoryTabs
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      {articles.isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );

  const feedArticles: Article[] = articles.data?.articles ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.fixedHeader,
          {
            top: topPad,
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.logo, { color: colors.foreground }]}>
          Africa
          <Text style={{ color: colors.primary }}>News</Text>
        </Text>
      </View>

      <View
        style={[
          styles.ticker,
          { top: topPad + HEADER_H, zIndex: 10 },
        ]}
      >
        <BreakingTicker articles={trending.data?.articles ?? []} />
      </View>

      <FlatList
        data={feedArticles}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ArticleCard article={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !articles.isLoading ? (
            <View style={styles.empty}>
              <Text
                style={[styles.emptyText, { color: colors.mutedForeground }]}
              >
                No articles found
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={
          Platform.OS === "web"
            ? { paddingBottom: 34 }
            : { paddingBottom: insets.bottom + 80 }
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!feedArticles.length || !articles.isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 44,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ticker: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  logo: {
    fontSize: 22,
    fontWeight: "700" as const,
    fontFamily: "Lora_700Bold",
    letterSpacing: -0.3,
  },
  loadingRow: {
    padding: 24,
    alignItems: "center",
  },
  empty: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
  },
});

import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetArticle } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const numericId = parseInt(String(id), 10);

  const { data: article, isLoading, isError, refetch } = useGetArticle(numericId);

  const handleReadFull = async () => {
    if (article?.url) {
      await WebBrowser.openBrowserAsync(article.url);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background, paddingTop: topPad },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError || !article) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: colors.background, paddingTop: topPad },
        ]}
      >
        <Feather name="alert-circle" size={40} color={colors.border} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Could not load article
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          onPress={() => refetch()}
        >
          <Text style={{ color: colors.primaryForeground, fontWeight: "600" }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.navBar,
          {
            paddingTop: topPad,
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
          testID="back-button"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleReadFull}
          style={[styles.shareBtn, { borderColor: colors.border }]}
          hitSlop={8}
        >
          <Feather name="external-link" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {article.imageUrl ? (
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
        ) : null}

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.categoryText, { color: colors.primaryForeground }]}>
                {article.category.toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.countryBadge,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.countryText, { color: colors.ink2 }]}>
                {article.country}
              </Text>
            </View>
          </View>

          <Text style={[styles.title, { color: colors.foreground }]}>
            {article.title}
          </Text>

          <View style={styles.sourceLine}>
            <Text style={[styles.sourceName, { color: colors.primary }]}>
              {article.sourceName}
            </Text>
            {article.author ? (
              <Text style={[styles.author, { color: colors.mutedForeground }]}>
                {" · "}{article.author}
              </Text>
            ) : null}
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {" · "}{formatDate(article.publishedDate)}
            </Text>
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.border }]}
          />

          {article.aiSummary ? (
            <View
              style={[
                styles.aiSummaryBox,
                { backgroundColor: colors.secondary, borderColor: colors.border },
              ]}
            >
              <View style={styles.aiLabel}>
                <Feather name="zap" size={12} color={colors.primary} />
                <Text style={[styles.aiLabelText, { color: colors.primary }]}>
                  AI Summary
                </Text>
              </View>
              <Text style={[styles.aiSummaryText, { color: colors.foreground }]}>
                {article.aiSummary}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.summary, { color: colors.ink2 }]}>
            {article.summary}
          </Text>

          <TouchableOpacity
            style={[styles.readBtn, { backgroundColor: colors.primary }]}
            onPress={handleReadFull}
            activeOpacity={0.85}
            testID="read-full-article-button"
          >
            <Text style={[styles.readBtnText, { color: colors.primaryForeground }]}>
              Read Full Article
            </Text>
            <Feather name="arrow-right" size={16} color={colors.primaryForeground} />
          </TouchableOpacity>

          <Text
            style={[styles.sourceAttrib, { color: colors.mutedForeground }]}
          >
            Source: {article.sourceName}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    marginTop: 8,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    padding: 4,
  },
  shareBtn: {
    padding: 4,
  },
  content: {
    flexGrow: 1,
  },
  heroImage: {
    width: "100%",
    height: 240,
  },
  body: {
    padding: 20,
    gap: 14,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700" as const,
    letterSpacing: 0.8,
  },
  countryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  countryText: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 32,
    fontFamily: "Lora_700Bold",
  },
  sourceLine: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  sourceName: {
    fontSize: 13,
    fontWeight: "600" as const,
  },
  author: {
    fontSize: 13,
  },
  date: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  aiSummaryBox: {
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  aiLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  aiLabelText: {
    fontSize: 11,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  aiSummaryText: {
    fontSize: 15,
    lineHeight: 22,
  },
  summary: {
    fontSize: 16,
    lineHeight: 26,
  },
  readBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 4,
  },
  readBtnText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  sourceAttrib: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});

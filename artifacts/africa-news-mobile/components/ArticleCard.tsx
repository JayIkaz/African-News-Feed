import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useColors } from "@/hooks/useColors";
import { Article } from "@workspace/api-client-react";

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ArticleCardProps {
  article: Article;
  variant?: "compact" | "featured";
}

export function ArticleCard({ article, variant = "compact" }: ArticleCardProps) {
  const colors = useColors();

  if (variant === "featured") {
    return (
      <TouchableOpacity
        style={[
          styles.featured,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => router.push(`/article/${article.id}`)}
        activeOpacity={0.8}
        testID={`article-card-${article.id}`}
      >
        <Image
          source={
            article.imageUrl
              ? { uri: article.imageUrl }
              : require("@/assets/images/icon.png")
          }
          style={styles.featuredImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.featuredContent}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: colors.secondary },
            ]}
          >
            <Text
              style={[styles.categoryText, { color: colors.primary }]}
            >
              {article.category}
            </Text>
          </View>
          <Text
            style={[styles.featuredTitle, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {article.title}
          </Text>
          <Text
            style={[styles.summary, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            {article.aiSummary ?? article.summary}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {article.sourceName} · {timeAgo(article.publishedDate)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.compact,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => router.push(`/article/${article.id}`)}
      activeOpacity={0.8}
      testID={`article-card-${article.id}`}
    >
      <View style={styles.compactContent}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: colors.secondary },
          ]}
        >
          <Text style={[styles.categoryText, { color: colors.primary }]}>
            {article.category}
          </Text>
        </View>
        <Text
          style={[styles.compactTitle, { color: colors.foreground }]}
          numberOfLines={3}
        >
          {article.title}
        </Text>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {article.sourceName} · {article.country} · {timeAgo(article.publishedDate)}
        </Text>
      </View>
      {article.imageUrl ? (
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
        />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  featured: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  featuredImage: {
    width: "100%",
    height: 180,
  },
  featuredContent: {
    padding: 14,
    gap: 6,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    lineHeight: 23,
    fontFamily: "Lora_700Bold",
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
  },
  compact: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  compactContent: {
    flex: 1,
    gap: 5,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    lineHeight: 21,
    fontFamily: "Lora_600SemiBold",
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    flexShrink: 0,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  meta: {
    fontSize: 12,
  },
});

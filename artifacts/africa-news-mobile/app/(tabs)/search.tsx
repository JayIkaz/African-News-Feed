import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useSearchArticles, getSearchArticlesQueryKey } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { ArticleCard } from "@/components/ArticleCard";

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const searchParams = { q: submitted, limit: 30 };
  const results = useSearchArticles(searchParams, {
    query: {
      queryKey: getSearchArticlesQueryKey(searchParams),
      enabled: submitted.length >= 2,
    },
  });

  const handleSubmit = () => {
    setSubmitted(query.trim());
  };

  const handleClear = () => {
    setQuery("");
    setSubmitted("");
  };

  const articles = results.data?.articles ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Search
        </Text>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.secondary, borderColor: colors.border },
          ]}
        >
          <Feather
            name="search"
            size={18}
            color={colors.mutedForeground}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Search African news..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCorrect={false}
            testID="search-input"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={8}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {results.isLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {!results.isLoading && submitted.length >= 2 && articles.length === 0 && (
        <View style={styles.empty}>
          <Feather
            name="search"
            size={36}
            color={colors.border}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            No results found
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Try different keywords
          </Text>
        </View>
      )}

      {submitted.length < 2 && !results.isLoading && (
        <View style={styles.empty}>
          <Feather
            name="globe"
            size={36}
            color={colors.border}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Search across Africa
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Find stories from 65+ sources
          </Text>
        </View>
      )}

      <FlatList
        data={articles}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ArticleCard article={item} />}
        contentContainerStyle={
          Platform.OS === "web"
            ? { paddingBottom: 34 }
            : { paddingBottom: insets.bottom + 80 }
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!!articles.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    fontFamily: "Lora_700Bold",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  loadingRow: {
    padding: 24,
    alignItems: "center",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
});

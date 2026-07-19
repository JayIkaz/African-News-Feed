import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useListCountries, useListArticles, getListArticlesQueryKey, CountrySummary } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { ArticleCard } from "@/components/ArticleCard";

const COUNTRY_FLAGS: Record<string, string> = {
  Algeria: "🇩🇿", Angola: "🇦🇴", Benin: "🇧🇯", Botswana: "🇧🇼",
  "Burkina Faso": "🇧🇫", Burundi: "🇧🇮", Cameroon: "🇨🇲",
  "Cape Verde": "🇨🇻", "Central African Republic": "🇨🇫", Chad: "🇹🇩",
  Comoros: "🇰🇲", Congo: "🇨🇬", "DR Congo": "🇨🇩",
  "Côte d'Ivoire": "🇨🇮", Djibouti: "🇩🇯", Egypt: "🇪🇬",
  "Equatorial Guinea": "🇬🇶", Eritrea: "🇪🇷", Ethiopia: "🇪🇹",
  Gabon: "🇬🇦", Gambia: "🇬🇲", Ghana: "🇬🇭", Guinea: "🇬🇳",
  "Guinea-Bissau": "🇬🇼", Kenya: "🇰🇪", Lesotho: "🇱🇸", Liberia: "🇱🇷",
  Libya: "🇱🇾", Madagascar: "🇲🇬", Malawi: "🇲🇼", Mali: "🇲🇱",
  Mauritania: "🇲🇷", Mauritius: "🇲🇺", Morocco: "🇲🇦", Mozambique: "🇲🇿",
  Namibia: "🇳🇦", Niger: "🇳🇪", Nigeria: "🇳🇬", Rwanda: "🇷🇼",
  "Sao Tome": "🇸🇹", Senegal: "🇸🇳", Seychelles: "🇸🇨",
  "Sierra Leone": "🇸🇱", Somalia: "🇸🇴", "South Africa": "🇿🇦",
  "South Sudan": "🇸🇸", Sudan: "🇸🇩", Swaziland: "🇸🇿", Tanzania: "🇹🇿",
  Togo: "🇹🇬", Tunisia: "🇹🇳", Uganda: "🇺🇬", Zambia: "🇿🇲",
  Zimbabwe: "🇿🇼",
};

function getFlag(country: string): string {
  return COUNTRY_FLAGS[country] ?? "🌍";
}

interface CountryChipProps {
  item: CountrySummary;
  isSelected: boolean;
  onPress: () => void;
}

function CountryChip({ item, isSelected, onPress }: CountryChipProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: isSelected ? colors.primary : colors.secondary,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.chipFlag}>{getFlag(item.country)}</Text>
      <Text
        style={[
          styles.chipLabel,
          { color: isSelected ? colors.primaryForeground : colors.foreground },
        ]}
        numberOfLines={1}
      >
        {item.country}
      </Text>
      <Text
        style={[
          styles.chipCount,
          {
            color: isSelected
              ? "rgba(255,255,255,0.7)"
              : colors.mutedForeground,
          },
        ]}
      >
        {item.articleCount}
      </Text>
    </TouchableOpacity>
  );
}

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const countries = useListCountries();
  const articleParams = selectedCountry
    ? { country: selectedCountry, limit: 30 }
    : { limit: 1 };
  const articles = useListArticles(articleParams, {
    query: {
      queryKey: getListArticlesQueryKey(articleParams),
      enabled: !!selectedCountry,
    },
  });

  const countryList = countries.data ?? [];

  const ListHeader = (
    <View>
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
          Explore by Country
        </Text>
        {countries.isLoading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: 12, marginBottom: 8 }}
          />
        ) : (
          <FlatList
            data={countryList}
            keyExtractor={(item) => item.country}
            renderItem={({ item }) => (
              <CountryChip
                item={item}
                isSelected={selectedCountry === item.country}
                onPress={() =>
                  setSelectedCountry(
                    selectedCountry === item.country ? null : item.country
                  )
                }
              />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipList}
            style={{ marginTop: 12, marginBottom: 8 }}
            scrollEnabled={!!countryList.length}
          />
        )}
      </View>
      {selectedCountry && (
        <View
          style={[
            styles.sectionHeader,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {getFlag(selectedCountry)} {selectedCountry}
          </Text>
        </View>
      )}
      {articles.isLoading && selectedCountry && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </View>
  );

  if (!selectedCountry) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <FlatList
          data={[]}
          keyExtractor={() => "empty"}
          renderItem={() => null}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={
            <View style={styles.placeholder}>
              <Text
                style={[styles.placeholderText, { color: colors.mutedForeground }]}
              >
                Select a country to browse its articles
              </Text>
            </View>
          }
          contentContainerStyle={
            Platform.OS === "web"
              ? { paddingBottom: 34 }
              : { paddingBottom: insets.bottom + 80 }
          }
          scrollEnabled={false}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={articles.data?.articles ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ArticleCard article={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          !articles.isLoading ? (
            <View style={styles.placeholder}>
              <Text
                style={[
                  styles.placeholderText,
                  { color: colors.mutedForeground },
                ]}
              >
                No articles found for {selectedCountry}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={
          Platform.OS === "web"
            ? { paddingBottom: 34 }
            : { paddingBottom: insets.bottom + 80 }
        }
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!(articles.data?.articles?.length)}
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
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    fontFamily: "Lora_700Bold",
  },
  chipList: {
    paddingRight: 16,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  chipFlag: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "500" as const,
    maxWidth: 90,
  },
  chipCount: {
    fontSize: 11,
    fontWeight: "500" as const,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  loadingRow: {
    padding: 24,
    alignItems: "center",
  },
  placeholder: {
    padding: 40,
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 15,
    textAlign: "center",
  },
});

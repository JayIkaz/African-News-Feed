import React, { useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

const CATEGORIES = [
  "All",
  "Politics",
  "Business",
  "Technology",
  "Economy",
  "Society",
  "Environment",
  "International",
];

interface CategoryTabsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selected === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.tab,
                isActive && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
              ]}
              onPress={() => onSelect(cat)}
              activeOpacity={0.7}
              testID={`category-tab-${cat}`}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? colors.primary : colors.mutedForeground,
                    fontWeight: isActive ? "600" : "400",
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
  },
  container: {
    flexDirection: "row",
    paddingHorizontal: 12,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 11,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
});

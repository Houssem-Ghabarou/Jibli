import DatePickerModal, {
  formatDateDisplay,
} from "@/components/DatePickerModal";
import LocationPicker, { PickerResult } from "@/components/LocationPicker";
import TripCard from "@/components/TripCard";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { getFlag } from "@/data/locations";
import { getMyRequestedTripIds } from "@/lib/firestore/requests";
import { getTrips, Trip } from "@/lib/firestore/trips";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUI } from "@/context/UIContext";

interface SearchLocation {
  city_name: string;
  country_code: string;
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useUI();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);

  const [requestedTripIds, setRequestedTripIds] = useState<Set<string>>(
    new Set(),
  );

  const [fromFilter, setFromFilter] = useState<SearchLocation | null>(null);
  const [toFilter, setToFilter] = useState<SearchLocation | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pickerFor, setPickerFor] = useState<"from" | "to" | null>(null);

  // Refs so useFocusEffect always reads the latest filter values
  const fromFilterRef = useRef(fromFilter);
  const toFilterRef = useRef(toFilter);
  const dateFromRef = useRef(dateFrom);
  const dateToRef = useRef(dateTo);
  useEffect(() => {
    fromFilterRef.current = fromFilter;
  }, [fromFilter]);
  useEffect(() => {
    toFilterRef.current = toFilter;
  }, [toFilter]);
  useEffect(() => {
    dateFromRef.current = dateFrom;
  }, [dateFrom]);
  useEffect(() => {
    dateToRef.current = dateTo;
  }, [dateTo]);

  async function fetchTrips(
    from?: string,
    to?: string,
    dFrom?: string | null,
    dTo?: string | null,
  ) {
    try {
      const result = await getTrips({
        from,
        to,
        dateFrom: dFrom ?? undefined,
        dateTo: dTo ?? undefined,
      });
      setTrips(result.data);
      setCursor(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err: any) {
      showToast(err.message || "Failed to load trips", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadMore() {
    if (!hasMore || loadingMore || !cursor) return;
    setLoadingMore(true);
    try {
      const result = await getTrips(
        {
          from: fromFilter?.city_name,
          to: toFilter?.city_name,
          dateFrom: dateFrom ?? undefined,
          dateTo: dateTo ?? undefined,
        },
        cursor,
      );
      setTrips((prev) => [...prev, ...result.data]);
      setCursor(result.lastDoc);
      setHasMore(result.hasMore);
    } finally {
      setLoadingMore(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      fetchTrips(
        fromFilterRef.current?.city_name,
        toFilterRef.current?.city_name,
        dateFromRef.current,
        dateToRef.current,
      );
      if (user) {
        getMyRequestedTripIds(user.uid).then(setRequestedTripIds);
      }
    }, [user]),
  );

  function onRefresh() {
    setRefreshing(true);
    fetchTrips(fromFilter?.city_name, toFilter?.city_name, dateFrom, dateTo);
  }

  function onSearch() {
    setLoading(true);
    fetchTrips(fromFilter?.city_name, toFilter?.city_name, dateFrom, dateTo);
  }

  function handlePickerSelect(result: PickerResult) {
    const loc: SearchLocation =
      "custom" in result
        ? { city_name: result.city, country_code: "" }
        : { city_name: result.city, country_code: result.country_code };

    if (pickerFor === "from") setFromFilter(loc);
    else setToFilter(loc);
  }

  const { unreadCount } = useNotifications();
  const firstName = user?.displayName?.split(" ")[0] ?? "there";
  const dateLabel = formatDateDisplay(dateFrom, dateTo);
  const hasDateFilter = dateFrom !== null;

  function SearchField({
    filter,
    placeholder,
    icon,
  }: {
    filter: SearchLocation | null;
    placeholder: string;
    icon: string;
  }) {
    const flag = filter?.country_code ? getFlag(filter.country_code) : null;
    return (
      <View style={styles.searchInput}>
        {flag ? (
          <Text style={styles.flagSmall}>{flag}</Text>
        ) : (
          <Ionicons name={icon as any} size={16} color={Colors.textMuted} />
        )}
        <Text
          style={[styles.searchText, !filter && styles.searchPlaceholder]}
          numberOfLines={1}
        >
          {filter ? filter.city_name : placeholder}
        </Text>
        {filter && (
          <TouchableOpacity
            onPress={() => {
              if (placeholder === "From...") setFromFilter(null);
              else setToFilter(null);
            }}
          >
            <Ionicons
              name="close-circle-outline"
              size={16}
              color="rgba(255,255,255,0.6)"
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {firstName}</Text>
            <Text style={styles.subtitle}>
              Find a traveler for your delivery
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/notifications")}
            style={styles.bellWrapper}
          >
            <Ionicons
              name="notifications-outline"
              size={26}
              color={Colors.white}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setPickerFor("from")}
          >
            <SearchField
              filter={fromFilter}
              placeholder="From..."
              icon="location-outline"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => setPickerFor("to")}
          >
            <SearchField
              filter={toFilter}
              placeholder="To..."
              icon="navigate-outline"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchButton} onPress={onSearch}>
            <Ionicons name="search-outline" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>

        {/* Date filter row */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[styles.dateChip, hasDateFilter && styles.dateChipActive]}
            onPress={() => setDatePickerOpen(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={hasDateFilter ? Colors.accent : "rgba(255,255,255,0.7)"}
            />
            <Text
              style={[
                styles.dateChipText,
                hasDateFilter && styles.dateChipTextActive,
              ]}
            >
              {dateLabel}
            </Text>
            {hasDateFilter && (
              <TouchableOpacity
                onPress={() => {
                  setDateFrom(null);
                  setDateTo(null);
                  setLoading(true);
                  fetchTrips(
                    fromFilter?.city_name,
                    toFilter?.city_name,
                    null,
                    null,
                  );
                }}
              >
                <Ionicons name="close-circle-outline" size={16} color={Colors.accent} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Trip Feed */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TripCard trip={item} isRequested={requestedTripIds.has(item.id)} />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                color={Colors.accent}
                style={{ marginVertical: 16 }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="airplane-outline"
                size={48}
                color={Colors.textMuted}
              />
              <Text style={styles.emptyText}>No trips found</Text>
              <Text style={styles.emptySubtext}>
                Be the first to post a trip!
              </Text>
            </View>
          }
        />
      )}

      <LocationPicker
        visible={pickerFor !== null}
        onClose={() => setPickerFor(null)}
        onSelect={handlePickerSelect}
        userLocation={null}
      />

      <DatePickerModal
        visible={datePickerOpen}
        mode="range"
        initialFrom={dateFrom}
        initialTo={dateTo}
        onConfirm={(from, to) => {
          setDateFrom(from);
          setDateTo(to);
          setDatePickerOpen(false);
          setLoading(true);
          fetchTrips(fromFilter?.city_name, toFilter?.city_name, from, to);
        }}
        onClear={() => {
          setDateFrom(null);
          setDateTo(null);
          setDatePickerOpen(false);
          setLoading(true);
          fetchTrips(fromFilter?.city_name, toFilter?.city_name, null, null);
        }}
        onClose={() => setDatePickerOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    backgroundColor: Colors.headerDark,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  flagSmall: {
    fontSize: 16,
  },
  searchText: {
    flex: 1,
    color: Colors.white,
    fontSize: 14,
  },
  searchPlaceholder: {
    color: "rgba(255,255,255,0.5)",
  },
  searchButton: {
    backgroundColor: Colors.accent,
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  bellWrapper: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#E74C3C",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.headerDark,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "700",
  },
  dateRow: {
    flexDirection: "row",
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dateChipActive: {
    backgroundColor: Colors.white,
  },
  dateChipText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  dateChipTextActive: {
    color: Colors.accent,
  },
  list: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

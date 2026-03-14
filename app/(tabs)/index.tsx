import DatePickerModal, {
  formatDateDisplay,
} from "@/components/DatePickerModal";
import LocationPicker, { PickerResult } from "@/components/LocationPicker";
import OpenRequestCard from "@/components/OpenRequestCard";
import TripCard from "@/components/TripCard";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import { useUI } from "@/context/UIContext";
import { getFlag } from "@/data/locations";
import {
  getMyOfferedOpenRequestIds,
  OpenRequest,
  subscribeToOpenRequests,
} from "@/lib/firestore/openRequests";
import { getMyRequestedTripIds } from "@/lib/firestore/requests";
import { subscribeToTrips, Trip } from "@/lib/firestore/trips";
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

interface SearchLocation {
  city_name: string;
  country_code: string;
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useUI();

  const [feedMode, setFeedMode] = useState<"all" | "trips" | "requests">("all");

  // Trips feed state
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestedTripIds, setRequestedTripIds] = useState<Set<string>>(new Set());

  // Open requests feed state
  const [openRequests, setOpenRequests] = useState<OpenRequest[]>([]);
  const [orLoading, setOrLoading] = useState(true);
  const [orRefreshing, setOrRefreshing] = useState(false);
  const [offeredRequestIds, setOfferedRequestIds] = useState<Set<string>>(new Set());

  const [fromFilter, setFromFilter] = useState<SearchLocation | null>(null);
  const [toFilter, setToFilter] = useState<SearchLocation | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [pickerFor, setPickerFor] = useState<"from" | "to" | null>(null);

  // Listener unsubscribe refs
  const tripsUnsubRef = useRef<(() => void) | null>(null);
  const orUnsubRef = useRef<(() => void) | null>(null);

  // Refs so useFocusEffect always reads the latest filter values
  const fromFilterRef = useRef(fromFilter);
  const toFilterRef = useRef(toFilter);
  const dateFromRef = useRef(dateFrom);
  const dateToRef = useRef(dateTo);
  useEffect(() => { fromFilterRef.current = fromFilter; }, [fromFilter]);
  useEffect(() => { toFilterRef.current = toFilter; }, [toFilter]);
  useEffect(() => { dateFromRef.current = dateFrom; }, [dateFrom]);
  useEffect(() => { dateToRef.current = dateTo; }, [dateTo]);

  function subscribeTrips(from?: string, to?: string, dFrom?: string | null, dTo?: string | null) {
    tripsUnsubRef.current?.();
    if (!user) return;
    setLoading(true);
    tripsUnsubRef.current = subscribeToTrips(
      { from, to, dateFrom: dFrom ?? undefined, dateTo: dTo ?? undefined },
      (data) => { setTrips(data); setLoading(false); setRefreshing(false); },
      (err: any) => { showToast(err.message || "Failed to load trips", "error"); setLoading(false); setRefreshing(false); },
    );
  }

  function subscribeOpenReqs(from?: string, to?: string) {
    orUnsubRef.current?.();
    if (!user) return;
    setOrLoading(true);
    orUnsubRef.current = subscribeToOpenRequests(
      { from, to },
      (data) => { setOpenRequests(data); setOrLoading(false); setOrRefreshing(false); },
      (err: any) => { showToast(err.message || "Failed to load requests", "error"); setOrLoading(false); setOrRefreshing(false); },
    );
  }

  useFocusEffect(
    useCallback(() => {
      subscribeTrips(
        fromFilterRef.current?.city_name,
        toFilterRef.current?.city_name,
        dateFromRef.current,
        dateToRef.current,
      );
      if (user) {
        getMyRequestedTripIds(user.uid).then(setRequestedTripIds);
        subscribeOpenReqs(fromFilterRef.current?.city_name, toFilterRef.current?.city_name);
        getMyOfferedOpenRequestIds(user.uid).then(setOfferedRequestIds);
      }
      return () => {
        tripsUnsubRef.current?.();
        orUnsubRef.current?.();
      };
    }, [user]),
  );

  function onRefresh() {
    if (!user) return;
    setRefreshing(true);
    subscribeTrips(fromFilter?.city_name, toFilter?.city_name, dateFrom, dateTo);
  }

  function onRefreshRequests() {
    if (!user) return;
    setOrRefreshing(true);
    subscribeOpenReqs(fromFilter?.city_name, toFilter?.city_name);
  }

  function onSearch() {
    if (!user) return;
    if (feedMode === "trips" || feedMode === "all") {
      subscribeTrips(fromFilter?.city_name, toFilter?.city_name, dateFrom, dateTo);
    }
    if (feedMode === "requests" || feedMode === "all") {
      subscribeOpenReqs(fromFilter?.city_name, toFilter?.city_name);
    }
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

        {/* Date filter — always visible */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            style={[
              styles.dateChip,
              hasDateFilter && styles.dateChipActive,
              feedMode === "requests" && styles.dateChipDisabled,
            ]}
            onPress={() => feedMode !== "requests" && setDatePickerOpen(true)}
            activeOpacity={feedMode !== "requests" ? 0.7 : 1}
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color={hasDateFilter && feedMode !== "requests" ? Colors.accent : "rgba(255,255,255,0.7)"}
            />
            <Text
              style={[
                styles.dateChipText,
                hasDateFilter && feedMode !== "requests" && styles.dateChipTextActive,
              ]}
            >
              {dateLabel}
            </Text>
            {hasDateFilter && feedMode !== "requests" && (
              <TouchableOpacity
                onPress={() => {
                  setDateFrom(null);
                  setDateTo(null);
                  subscribeTrips(fromFilter?.city_name, toFilter?.city_name, null, null);
                }}
              >
                <Ionicons name="close-circle-outline" size={16} color={Colors.accent} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>

        {/* Feed mode toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, feedMode === "all" && styles.toggleBtnActive]}
            onPress={() => setFeedMode("all")}
          >
            <Text style={[styles.toggleText, feedMode === "all" && styles.toggleTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, feedMode === "trips" && styles.toggleBtnActive]}
            onPress={() => setFeedMode("trips")}
          >
            <Text style={[styles.toggleText, feedMode === "trips" && styles.toggleTextActive]}>
              Trips
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, feedMode === "requests" && styles.toggleBtnActive]}
            onPress={() => setFeedMode("requests")}
          >
            <Text style={[styles.toggleText, feedMode === "requests" && styles.toggleTextActive]}>
              Requests
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed */}
      {feedMode === "all" ? (
        loading || orLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        ) : (
          <FlatList
            data={[
              ...trips.map((t) => ({ type: "trip" as const, id: t.id, data: t })),
              ...openRequests.map((r) => ({ type: "request" as const, id: r.id, data: r })),
            ].sort((a, b) => {
              const aTime = (a.data.createdAt as any)?.seconds ?? 0;
              const bTime = (b.data.createdAt as any)?.seconds ?? 0;
              return bTime - aTime;
            })}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            renderItem={({ item }) =>
              item.type === "trip" ? (
                <TripCard trip={item.data} isRequested={requestedTripIds.has(item.id)} />
              ) : (
                <OpenRequestCard request={item.data} hasOffered={offeredRequestIds.has(item.id)} />
              )
            }
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing || orRefreshing}
                onRefresh={() => { onRefresh(); onRefreshRequests(); }}
                tintColor={Colors.accent}
              />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="globe-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>Nothing here yet</Text>
                <Text style={styles.emptySubtext}>Be the first to post!</Text>
              </View>
            }
          />
        )
      ) : feedMode === "trips" ? (
        loading ? (
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
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="navigate-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No trips found</Text>
                <Text style={styles.emptySubtext}>Be the first to post a trip!</Text>
              </View>
            }
          />
        )
      ) : (
        orLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Colors.accent} size="large" />
          </View>
        ) : (
          <FlatList
            data={openRequests}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <OpenRequestCard request={item} hasOffered={offeredRequestIds.has(item.id)} />
            )}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl refreshing={orRefreshing} onRefresh={onRefreshRequests} tintColor={Colors.accent} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="bag-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No requests found</Text>
                <Text style={styles.emptySubtext}>Be the first to post a request!</Text>
              </View>
            }
          />
        )
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
          subscribeTrips(fromFilter?.city_name, toFilter?.city_name, from, to);
        }}
        onClear={() => {
          setDateFrom(null);
          setDateTo(null);
          setDatePickerOpen(false);
          subscribeTrips(fromFilter?.city_name, toFilter?.city_name, null, null);
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
  dateChipDisabled: {
    opacity: 0.35,
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
  toggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: 3,
    alignSelf: "flex-start",
  },
  toggleBtn: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 18,
  },
  toggleBtnActive: {
    backgroundColor: Colors.white,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  toggleTextActive: {
    color: Colors.headerDark,
  },
});

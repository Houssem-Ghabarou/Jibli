import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getNotifications, markAsRead, Notification } from '@/lib/firestore/notifications';

const TYPE_ICONS: Record<string, string> = {
  new_request: 'bag-outline',
  request_accepted: 'checkmark-circle-outline',
  new_message: 'chatbubble-outline',
  delivery_confirmed: 'cube-outline',
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.uid).then(n => {
      setNotifications(n);
      setLoading(false);
    });
  }, [user]);

  async function handlePress(item: Notification) {
    if (!user) return;
    if (!item.read) {
      await markAsRead(user.uid, item.id);
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, read: true } : n))
      );
    }

    if (item.type === 'new_request' || item.type === 'request_accepted') {
      router.push(`/request/${item.relatedId}`);
    } else if (item.type === 'new_message') {
      router.push(`/chat/${item.relatedId}`);
    }
  }

  function renderItem({ item }: { item: Notification }) {
    return (
      <TouchableOpacity
        style={[styles.item, !item.read && styles.unread]}
        onPress={() => handlePress(item)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, !item.read && styles.iconCircleActive]}>
          <Ionicons
            name={(TYPE_ICONS[item.type] ?? 'notifications-outline') as any}
            size={20}
            color={item.read ? Colors.textSecondary : Colors.accent}
          />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unread: {
    backgroundColor: '#FFF5F4',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleActive: {
    backgroundColor: '#FFE8E4',
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

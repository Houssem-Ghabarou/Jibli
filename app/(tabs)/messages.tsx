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
import { subscribeToConversations, Conversation } from '@/lib/firestore/conversations';
import { getUserProfile, UserProfile } from '@/lib/firestore/users';

export default function MessagesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToConversations(user.uid, async (convs) => {
      setConversations(convs);
      setLoading(false);

      const otherUids = convs
        .map(c => c.participants.find(p => p !== user.uid))
        .filter(Boolean) as string[];

      const uniqueUids = [...new Set(otherUids)];
      const fetched: Record<string, UserProfile> = {};
      await Promise.all(
        uniqueUids.map(async uid => {
          const profile = await getUserProfile(uid);
          if (profile) fetched[uid] = profile;
        })
      );
      setProfiles(prev => ({ ...prev, ...fetched }));
    });
    return unsub;
  }, [user]);

  function renderItem({ item }: { item: Conversation }) {
    const otherUid = item.participants.find(p => p !== user?.uid) ?? '';
    const other = profiles[otherUid];

    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(`/chat/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {other?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{other?.name ?? 'Unknown'}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || 'No messages yet'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Accept a request to start chatting</Text>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  lastMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

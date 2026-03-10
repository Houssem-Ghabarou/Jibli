import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { logout } from '@/lib/auth';
import { getUserProfile, UserProfile } from '@/lib/firestore/users';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function ActionRow({
  icon,
  label,
  onPress,
  danger,
  last,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.row, last && styles.rowLast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon as any} size={22} color={danger ? '#E74C3C' : Colors.textPrimary} />
      <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast, confirm } = useUI();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then(p => {
      setProfile(p);
      setLoading(false);
    });
  }, [user]);

  async function handleLogout() {
    confirm({
      title: 'Logout',
      message: 'Are you sure you want to sign out?',
      dangerous: true,
      confirmText: 'Logout',
      onConfirm: async () => {
        await logout();
      }
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          {profile?.avatarUrl ? (
            <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          )}
        </View>
        <Text style={styles.name}>{profile?.name ?? user?.displayName ?? 'User'}</Text>
        {profile?.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.location}>{profile.location}</Text>
          </View>
        )}
        {/* <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.deliveryCount ?? 0}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
        </View> */}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <ActionRow
          icon="airplane-outline"
          label="My Trips"
          onPress={() => router.push('/(tabs)/trips')}
        />
        {/* <ActionRow
          icon="bag-outline"
          label="My Requests"
          onPress={() => router.push('/orders')}

        /> */}
        <ActionRow
          icon="receipt-outline"
          label="My Requests"
          onPress={() => router.push('/(tabs)/requests')}
          last
        />
      </View>

      <View style={styles.section}>
        <ActionRow
          icon="create-outline"
          label="Edit Profile"
          onPress={() => router.push('/profile/edit')}
        />
        <ActionRow
          icon="notifications-outline"
          label="Notification Settings"
          onPress={() => showToast('Coming soon', 'info')}
        />
        <ActionRow
          icon="help-circle-outline"
          label="Help & Support"
          onPress={() => showToast('Contact us at support@jibli.app', 'info')}
          last
        />
      </View>

      <View style={styles.section}>
        <ActionRow
          icon="log-out-outline"
          label="Logout"
          onPress={handleLogout}
          danger
          last
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingTop: 64,
    paddingBottom: 24,
    marginBottom: 16,
    gap: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
    gap: 24,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  section: {
    backgroundColor: Colors.white,
    marginBottom: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#E74C3C',
  },
});

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { getUserProfile, UserProfile } from '@/lib/firestore/users';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PublicProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const { showToast } = useUI();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        getUserProfile(id).then(p => {
            setProfile(p);
            setLoading(false);
        });
    }, [id]);

    function handleCall() {
        if (!profile?.phone) return;
        Linking.openURL(`tel:${profile.phone}`).catch(() => {
            showToast('Could not open phone app', 'error');
        });
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={Colors.accent} size="large" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.center}>
                <Text style={styles.notFoundText}>User not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isSelf = currentUser?.uid === profile.uid;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backIcon}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>User Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        {profile.avatarUrl ? (
                            <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {profile.name?.charAt(0).toUpperCase() ?? '?'}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.name}>{profile.name}</Text>
                    {profile.location && (
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
                            <Text style={styles.location}>{profile.location}</Text>
                        </View>
                    )}
                </View>

                {/* Bio Section */}
                {profile.bio ? (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>About {profile.name.split(' ')[0]}</Text>
                        <Text style={styles.bioText}>{profile.bio}</Text>
                    </View>
                ) : null}

                {/* Contact info (only if not self and phone exists) */}
                {!isSelf && profile.phone ? (
                    <View style={styles.card}>
                        <Text style={styles.sectionTitle}>Contact</Text>
                        <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
                            <View style={styles.contactIconBg}>
                                <Ionicons name="call" size={20} color={Colors.accent} />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactLabel}>Phone Number</Text>
                                <Text style={styles.contactValue}>{profile.phone}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                ) : null}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.surface,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
    },
    notFoundText: {
        fontSize: 16,
        color: Colors.textSecondary,
        marginBottom: 16,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: Colors.accent,
        borderRadius: 20,
    },
    backButtonText: {
        color: Colors.white,
        fontWeight: '600',
    },
    header: {
        backgroundColor: Colors.headerDark,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    backIcon: {
        padding: 4,
        marginLeft: -4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.white,
    },
    content: {
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        backgroundColor: Colors.white,
        paddingVertical: 32,
        marginBottom: 16,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: Colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    avatarImage: {
        width: 96,
        height: 96,
        borderRadius: 48,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: Colors.white,
    },
    name: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: 15,
        color: Colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingHorizontal: 40,
    },
    stat: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    card: {
        backgroundColor: Colors.white,
        padding: 20,
        marginBottom: 16,
        marginHorizontal: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.textPrimary,
    },
    bioText: {
        fontSize: 15,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 4,
    },
    contactIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactInfo: {
        flex: 1,
    },
    contactLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginBottom: 2,
    },
    contactValue: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textPrimary,
    },
});

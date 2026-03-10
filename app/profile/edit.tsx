import { uploadFileToCloudinary } from '@/cloudinary/CloudinaryHelper';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { getUserProfile, updateUserProfile } from '@/lib/firestore/users';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function EditProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useUI();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then(profile => {
      if (profile) {
        setName(profile.name ?? '');
        setLocation(profile.location ?? '');
        setPhone((profile as any).phone ?? '');
        setBio((profile as any).bio ?? '');
        setAvatarUri(profile.avatarUrl ?? null);
      }
      setLoading(false);
    });
  }, [user]);

  async function handleSave() {
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }

    setSaving(true);
    try {
      let finalAvatarUrl = avatarUri;

      // If the avatarUri is a local file (not already an http url uploaded), upload it to cloudinary
      if (avatarUri && !avatarUri.startsWith('http') && user) {
        try {
          finalAvatarUrl = await uploadFileToCloudinary(avatarUri, 'avatars', `avatar_${user.uid}`);
        } catch (uploadError: any) {
          showToast(`Failed to upload photo: ${uploadError.message}`, 'error');
          setSaving(false);
          return;
        }
      }

      await updateUserProfile(user!.uid, {
        name: name.trim(),
        location: location.trim() || null,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        avatarUrl: finalAvatarUrl,
      } as any);
      showToast('Profile updated successfully', 'success');
      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch (error) {
      showToast('Error selecting image', 'error');
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatar} onPress={pickImage} activeOpacity={0.8}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase() || '?'}</Text>
            )}
            <View style={styles.editIconBadge}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={Colors.textMuted}
            autoComplete="name"
          />
        </View>

        {/* <View style={styles.field}>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Paris, France"
            placeholderTextColor={Colors.textMuted}
          />
        </View> */}

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number (optional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+216 XX XXX XXX"
            placeholderTextColor={Colors.textMuted}
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bio (optional)</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell requesters a bit about yourself..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  form: {
    padding: 20,
    gap: 16,
    paddingBottom: 48,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.white,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.textPrimary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  avatarHint: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  textarea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

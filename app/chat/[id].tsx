import { getOptimizedImageUrl, uploadFileToCloudinary } from '@/cloudinary/CloudinaryHelper';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { getConversation, markConversationRead, Message, sendMessage, subscribeToMessages } from '@/lib/firestore/conversations';
import { getUserProfile } from '@/lib/firestore/users';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [otherName, setOtherName] = useState('Chat');
  const [otherUid, setOtherUid] = useState('');
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);
  const [convLoaded, setConvLoaded] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { bottom, top } = useSafeAreaInsets();


  function openPickerModal() {
    setShowPickerModal(true);
  }

  function closePickerModal() {
    setShowPickerModal(false);
  }

  function handlePickerOption(source: 'camera' | 'gallery') {
    closePickerModal();
    setTimeout(() => pickImage(source), 100);
  }

  function openFullscreen(url: string) {
    setFullscreenImage(url);
  }

  function closeFullscreen() {
    setFullscreenImage(null);
  }

  useEffect(() => {
    getConversation(id).then(conv => {
      if (conv && user) {
        const other = conv.participants.find(p => p !== user.uid) ?? '';
        setOtherUid(other);
        setOtherName(conv.participantNames?.[other] ?? 'Chat');
        markConversationRead(id, user.uid);
        getUserProfile(other).then(p => {
          if (p?.avatarUrl) setOtherAvatar(p.avatarUrl);
        });
      }
      setConvLoaded(true);
    });
    const unsub = subscribeToMessages(id, msgs => {
      setMessages(msgs);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  async function handleSend() {
    if (!text.trim() || !user) return;
    const msg = text.trim();
    setText('');
    setSending(true);
    try {
      await sendMessage(id, user.uid, otherUid, msg);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  }

  async function pickImage(source: 'gallery' | 'camera') {
    let result: ImagePicker.ImagePickerResult;

    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Camera permission is required to take photos.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Photo library access is required.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
      });
    }

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];

    // Validate file type
    const mimeType = asset.mimeType ?? '';
    if (mimeType && !ALLOWED_TYPES.includes(mimeType)) {
      Alert.alert('Invalid file', 'Only JPEG, PNG, and WebP images are allowed.');
      return;
    }

    // Validate file size
    if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
      Alert.alert('File too large', 'Image must be under 5 MB.');
      return;
    }

    setPendingImage(asset.uri);
  }

  function showImageSourcePicker() {
    openPickerModal();
  }

  async function handleSendImage() {
    if (!pendingImage || !user) return;
    setUploadingImage(true);
    try {
      const imageUrl = await uploadFileToCloudinary(
        pendingImage,
        `chat/${id}`,
        `msg_${Date.now()}.jpg`,
      );
      await sendMessage(id, user.uid, otherUid, '', imageUrl);
      setPendingImage(null);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      Alert.alert('Upload failed', err.message || 'Could not send image.');
    } finally {
      setUploadingImage(false);
    }
  }

  function formatMsgTime(ts: any): string {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function renderMessage({ item }: { item: Message }) {
    const isMe = item.senderId === user?.uid;
    const hasImage = !!item.imageUrl;
    const hasText = !!item.text;

    return (
      <View style={[styles.bubbleWrapper, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
        {hasImage && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => openFullscreen(item.imageUrl!)}
          >
            <Image
              source={{ uri: getOptimizedImageUrl(item.imageUrl!, 600, undefined, 80) }}
              style={[styles.bubbleImage, isMe ? styles.bubbleImageMe : styles.bubbleImageThem]}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        {hasText && (
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
              {item.text}
            </Text>
          </View>
        )}
        <Text style={[styles.timestamp, isMe ? styles.timestampRight : styles.timestampLeft]}>
          {formatMsgTime((item as any).createdAt)}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        {convLoaded ? (
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={() => {
              if (otherUid) router.push(`/user/${otherUid}` as any);
            }}
            disabled={!otherUid}
          >
            <View style={styles.headerAvatar}>
              {otherAvatar ? (
                <Image source={{ uri: otherAvatar }} style={styles.headerAvatarImage} />
              ) : (
                <Text style={styles.headerAvatarText}>{otherName.charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <Text style={styles.headerTitle}>{otherName}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerLeft}>
            <ActivityIndicator color={Colors.white} size="small" />
          </View>
        )}
      </View>

      {(loading || !convLoaded) ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
            </View>
          }
        />
      )}

      {/* Pending image preview */}
      {pendingImage && (
        <View style={styles.previewBar}>
          <Image source={{ uri: pendingImage }} style={styles.previewThumb} />
          <View style={styles.previewInfo}>
            <Text style={styles.previewLabel}>Send this photo?</Text>
          </View>
          <TouchableOpacity onPress={() => setPendingImage(null)} disabled={uploadingImage}>
            <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.previewSendBtn, uploadingImage && styles.sendDisabled]}
            onPress={handleSendImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <Ionicons name="send" size={16} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.inputRow, { paddingBottom: Math.max(bottom, 12) }]}>
        <TouchableOpacity
          style={styles.attachButton}
          onPress={showImageSourcePicker}
          disabled={uploadingImage}
        >
          <Ionicons name="camera-outline" size={22} color={Colors.accent} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={Colors.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || sending) && styles.sendDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <Ionicons name="send" size={18} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {/* Image source picker modal */}
      <Modal visible={showPickerModal} transparent animationType="fade" onRequestClose={closePickerModal}>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerBackdrop} />
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Attach Photo</Text>
            <Text style={styles.pickerMessage}>Choose how you want to add a photo</Text>

            <View style={styles.pickerOptions}>
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={() => handlePickerOption('camera')}
                activeOpacity={0.7}
              >
                <View style={styles.pickerIconBg}>
                  <Ionicons name="camera" size={24} color={Colors.accent} />
                </View>
                <Text style={styles.pickerOptionText}>Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pickerOption}
                onPress={() => handlePickerOption('gallery')}
                activeOpacity={0.7}
              >
                <View style={styles.pickerIconBg}>
                  <Ionicons name="images" size={24} color={Colors.accent} />
                </View>
                <Text style={styles.pickerOptionText}>Gallery</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.pickerCancelBtn} onPress={closePickerModal} activeOpacity={0.7}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Fullscreen image viewer */}
      <Modal visible={!!fullscreenImage} transparent animationType="fade" onRequestClose={closeFullscreen}>
        <View style={styles.fullscreenOverlay}>
          <View style={styles.fullscreenContent}>
            {fullscreenImage && (
              <Image
                source={{ uri: fullscreenImage }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            )}
          </View>
          <TouchableOpacity
            style={[styles.fullscreenCloseBtn, { top: top + 12 }]}
            onPress={closeFullscreen}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    backgroundColor: Colors.headerDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    padding: 16,
    gap: 8,
    paddingBottom: 8,
  },
  bubbleWrapper: {
    marginBottom: 6,
  },
  bubbleRight: {
    alignItems: 'flex-end',
  },
  bubbleLeft: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  bubbleMe: {
    backgroundColor: Colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: Colors.white,
  },
  bubbleTextThem: {
    color: Colors.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    marginHorizontal: 4,
  },
  timestampRight: {
    textAlign: 'right',
  },
  timestampLeft: {
    textAlign: 'left',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: Colors.accent,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.5,
  },
  attachButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleImage: {
    width: 220,
    height: 220,
    borderRadius: 14,
  },
  bubbleImageMe: {
    borderBottomRightRadius: 4,
  },
  bubbleImageThem: {
    borderBottomLeftRadius: 4,
  },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  previewThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  previewInfo: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  previewSendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 9999,
  },
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  pickerMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  pickerOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  pickerOption: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    paddingVertical: 20,
    borderRadius: 12,
  },
  pickerIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pickerCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  pickerCancelText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenCloseBtn: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

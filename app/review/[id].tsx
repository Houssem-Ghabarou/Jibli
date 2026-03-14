import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useScrollToFocusedInput } from '@/hooks/useScrollToFocusedInput';
import KeyboardDoneBar, { KEYBOARD_DONE_BAR_HEIGHT } from '@/components/ui/KeyboardDoneBar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { updateRequestStatus } from '@/lib/firestore/requests';
import { getUserProfile } from '@/lib/firestore/users';
import firestore from '@react-native-firebase/firestore';
import { useUI } from '@/context/UIContext';

export default function ReviewScreen() {
  const { id, travelerName, travelerId } = useLocalSearchParams<{
    id: string;
    travelerName: string;
    travelerId: string;
  }>();
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useUI();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [travelerAvatar, setTravelerAvatar] = useState<string | null>(null);
  const { keyboardHeight, isKeyboardVisible, dismiss } = useKeyboard();
  const { scrollRef, registerField } = useScrollToFocusedInput(keyboardHeight);

  useEffect(() => {
    if (travelerId) {
      getUserProfile(travelerId).then(p => {
        if (p?.avatarUrl) setTravelerAvatar(p.avatarUrl);
      });
    }
  }, [travelerId]);

  async function handleSubmit() {
    if (rating === 0) {
      showToast('Please select a star rating', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await firestore().collection('reviews').add({
        requestId: id,
        reviewerId: user!.uid,
        travelerId,
        rating,
        comment: comment.trim() || null,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      // Update traveler's average rating
      const travelerRef = firestore().collection('users').doc(travelerId);
      await firestore().runTransaction(async tx => {
        const doc = await tx.get(travelerRef);
        if (!doc.exists) return;
        const data = doc.data()!;
        const currentCount = data.reviewCount ?? 0;
        const currentRating = data.rating ?? 0;
        const newCount = currentCount + 1;
        const newRating = (currentRating * currentCount + rating) / newCount;
        tx.update(travelerRef, { rating: newRating, reviewCount: newCount });
      });

      showToast('Your review has been submitted.', 'success');
      router.back();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave a Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 16 + keyboardHeight + (isKeyboardVisible ? KEYBOARD_DONE_BAR_HEIGHT : 0) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Traveler info */}
        <View style={styles.travelerSection}>
          <View style={styles.avatar}>
            {travelerAvatar ? (
              <Image source={{ uri: travelerAvatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {travelerName?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            )}
          </View>
          <Text style={styles.travelerName}>{travelerName}</Text>
          <Text style={styles.travelerLabel}>Your traveler</Text>
        </View>

        {/* Star rating */}
        <View style={styles.card}>
          <Text style={styles.ratingLabel}>How was your experience?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? Colors.star : Colors.textMuted}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
            </Text>
          )}
        </View>

        {/* Comment */}
        <View style={styles.card} {...registerField(0)}>
          <Text style={styles.commentLabel}>Comment (optional)</Text>
          <TextInput
            style={styles.textarea}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience with this traveler..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            onFocus={registerField(0).onFocus}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (submitting || rating === 0) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <KeyboardDoneBar
        visible={isKeyboardVisible}
        keyboardHeight={keyboardHeight}
        onDone={dismiss}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    flex: 1,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 48,
  },
  travelerSection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
  },
  travelerName: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  travelerLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.star,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    alignSelf: 'flex-start',
  },
  textarea: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

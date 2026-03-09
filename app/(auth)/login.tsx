import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { login } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      // AuthGuard will redirect to tabs
    } catch (err: any) {
      const code = err?.code ?? '';
      const message =
        code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found'
          ? 'Incorrect email or password. Please try again.'
          : code === 'auth/invalid-email'
          ? 'Please enter a valid email address.'
          : code === 'auth/too-many-requests'
          ? 'Too many failed attempts. Try again later.'
          : err.message || 'Login failed. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your Jibli account</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputFlex]}
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(v => !v)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
          <Text style={styles.link}>
            Don't have an account? <Text style={styles.linkAccent}>Create one</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  back: {
    color: Colors.accent,
    fontSize: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  form: {
    paddingHorizontal: 24,
    gap: 16,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  eyeButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
  },
  linkAccent: {
    color: Colors.accent,
    fontWeight: '600',
  },
});

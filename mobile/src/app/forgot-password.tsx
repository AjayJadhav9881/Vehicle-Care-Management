
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Colors } from '@/theme/colors';
import AppButton from '@/components/common/AppButton';
import AppTextInput from '@/components/common/AppTextInput';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetLink = async () => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email address is required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    // Temporary frontend test.
    // Actual reset email functionality will come from our backend.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);

    Alert.alert(
      'Request Submitted',
      'Your email passed validation. Password reset functionality will be connected to the backend later.',
      [
        {
          text: 'Back to Login',
          onPress: () => router.replace('/login'),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>← Back to Login</Text>
          </Pressable>

          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔐</Text>
          </View>

          <Text style={styles.heading}>Forgot Password?</Text>

          <Text style={styles.description}>
            Don't worry! Enter your registered email address and we'll help
            you reset your password.
          </Text>

          <AppTextInput
            label="Email Address"
            placeholder="Enter your registered email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={emailError}
          />

          <AppButton
            title="Send Reset Link"
            onPress={handleSendResetLink}
            loading={loading}
            style={styles.submitButton}
          />

          <Pressable
            onPress={() => router.replace('/login')}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>Remember your password? </Text>
            <Text style={styles.loginLink}>Sign In</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
    marginBottom: 55,
  },
  backText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  iconContainer: {
    width: 76,
    height: 76,
    borderRadius: 25,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  icon: {
    fontSize: 34,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
    marginTop: 12,
    marginBottom: 32,
  },
  submitButton: {
    marginTop: 8,
  },
  loginButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  loginText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});

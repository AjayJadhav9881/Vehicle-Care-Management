
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';

import { Colors } from '@/theme/colors';
import AppButton from '@/components/common/AppButton';
import AppTextInput from '@/components/common/AppTextInput';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setIsLoading] = useState(false);

  const { login } = useAuth();

  const validateForm = () => {
    let isValid = true;

    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must contain at least 8 characters.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      await login({
        email: email.trim(),
        password,
      });

      router.replace('/explore');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Unable to login. Please try again.';

      Alert.alert('Login failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>VC</Text>
            </View>

            <Text style={styles.brandName}>Vehicle Care</Text>
            <Text style={styles.tagline}>
              Your vehicle. Your responsibility. Our assistance.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.heading}>Welcome Back!</Text>

            <Text style={styles.description}>
              Sign in to manage your vehicles and stay on top of maintenance.
            </Text>

            <View style={styles.form}>
              <AppTextInput
                label="Email Address"
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={emailError}
              />

              <AppTextInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                isPassword
                autoCapitalize="none"
                error={passwordError}
              />

              <Pressable
                style={styles.forgotButton}
                onPress={() => router.push('/forgot-password')}
              >
                <Text style={styles.forgotText}>
                  Forgot Password?
                </Text>
              </Pressable>

              <AppButton
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
              />
            </View>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>

              <Pressable onPress={() => router.push('/register')}>
                <Text style={styles.registerLink}> Create Account</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>
            Smart care for every journey.
          </Text>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 35,
    paddingBottom: 25,
  },
  header: {
    alignItems: 'center',
    marginBottom: 42,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.surface,
  },
  brandName: {
    fontSize: 23,
    fontWeight: '800',
    color: Colors.primaryDark,
  },
  tagline: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 7,
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: Colors.textSecondary,
    marginTop: 9,
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -5,
    marginBottom: 23,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  loginButton: {
    marginTop: 3,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 27,
  },
  registerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  footer: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 'auto',
    paddingTop: 35,
  },
});

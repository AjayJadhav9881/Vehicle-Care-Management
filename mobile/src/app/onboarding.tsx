
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/theme/colors';

const onboardingData = [
  {
    id: '1',
    emoji: '🚗',
    tag: 'YOUR DIGITAL GARAGE',
    title: 'Your Vehicles,\nOne Place',
    description:
      'Manage all your cars and bikes in one place. Keep your vehicle information organized and accessible.',
    floatingEmoji: '🏍️',
    floatingText: 'Multiple vehicles',
  },
  {
    id: '2',
    emoji: '🛠️',
    tag: 'SMART MAINTENANCE',
    title: 'Never Miss\nMaintenance',
    description:
      'Keep track of servicing, insurance, PUC and expenses. Get timely reminders before important dates.',
    floatingEmoji: '🔔',
    floatingText: 'Smart reminders',
  },
  {
    id: '3',
    emoji: '🤖',
    tag: 'POWERED BY AI',
    title: 'Meet Your AI\nVehicle Assistant',
    description:
      'Get helpful vehicle maintenance guidance, understand common problems and make smarter decisions.',
    floatingEmoji: '✨',
    floatingText: 'AI assistance',
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();

  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex === onboardingData.length - 1;

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / width);

    setActiveIndex(index);
  };

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({
      x: index * width,
      animated: true,
    });
  };

  const handleNext = () => {
    if (isLastSlide) {
      router.replace('/login');
      return;
    }

    goToSlide(activeIndex + 1);
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top navigation */}
      <View style={styles.header}>
        <View style={styles.brandContainer}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>VC</Text>
          </View>

          <Text style={styles.brandName}>Vehicle Care</Text>
        </View>

        <Pressable
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip onboarding"
          hitSlop={12}
        >
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Onboarding slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
        decelerationRate="fast"
      >
        {onboardingData.map((item) => (
          <View
            key={item.id}
            style={[styles.slide, { width }]}
          >
            {/* Illustration */}
            <View style={styles.illustrationContainer}>
              <View style={styles.decorativeCircle} />
              <View style={styles.decorativeCircleSmall} />

              <View style={styles.mainIllustration}>
                <Text style={styles.mainEmoji}>
                  {item.emoji}
                </Text>
              </View>

              <View style={styles.floatingCard}>
                <Text style={styles.floatingEmoji}>
                  {item.floatingEmoji}
                </Text>

                <Text style={styles.floatingText}>
                  {item.floatingText}
                </Text>
              </View>

              <View style={styles.smallDot} />
            </View>

            {/* Content */}
            <View style={styles.textContainer}>
              <Text style={styles.tag}>{item.tag}</Text>

              <Text style={styles.title}>
                {item.title}
              </Text>

              <Text style={styles.description}>
                {item.description}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom navigation */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {onboardingData.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.dot,
                activeIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleNext}
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Continue'}
          </Text>

          <Text style={styles.arrowText}>
            →
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          YOUR VEHICLE. OUR CARE.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    height: 65,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  brandIcon: {
    width: 34,
    height: 34,
    backgroundColor: Colors.primary,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandIconText: {
    color: Colors.surface,
    fontWeight: '800',
    fontSize: 12,
  },

  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primaryDark,
  },

  skipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  slide: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: 'center',
  },

  illustrationContainer: {
    height: '45%',
    minHeight: 220,
    maxHeight: 330,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },

  decorativeCircle: {
    position: 'absolute',
    width: 235,
    height: 235,
    borderRadius: 118,
    backgroundColor: Colors.primaryLight,
  },

  decorativeCircleSmall: {
    position: 'absolute',
    width: 185,
    height: 185,
    borderRadius: 93,
    borderWidth: 1,
    borderColor: '#C7E6D4',
  },

  mainIllustration: {
    width: 150,
    height: 150,
    borderRadius: 45,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },

  mainEmoji: {
    fontSize: 76,
  },

  floatingCard: {
    position: 'absolute',
    bottom: 28,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 9,
    elevation: 5,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  floatingEmoji: {
    fontSize: 20,
  },

  floatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryDark,
  },

  smallDot: {
    position: 'absolute',
    top: 28,
    left: 40,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.primary,
  },

  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 5,
  },

  tag: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 15,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primaryDark,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.7,
  },

  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 16,
    paddingHorizontal: 8,
  },

  footer: {
    paddingHorizontal: 25,
    paddingTop: 12,
    paddingBottom: 15,
    alignItems: 'center',
  },

  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 23,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: '#D8E2DC',
  },

  activeDot: {
    width: 27,
    backgroundColor: Colors.primary,
  },

  nextButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 17,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  nextButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },

  arrowText: {
    color: Colors.surface,
    fontSize: 21,
    fontWeight: '600',
  },

  footerText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    color: Colors.textSecondary,
    marginTop: 17,
  },
});

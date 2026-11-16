
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { createVehicle } from '../services/vehicle.service';
import { Colors } from '@/theme/colors';

type VehicleType = 'Car' | 'Bike' | 'Scooter' | 'Other';
type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid' | 'Other';

const vehicleTypes: VehicleType[] = [
  'Car',
  'Bike',
  'Scooter',
  'Other',
];

const fuelTypes: FuelType[] = [
  'Petrol',
  'Diesel',
  'CNG',
  'Electric',
  'Hybrid',
  'Other',
];

export default function AddVehicleScreen() {
  const router = useRouter();

  const [vehicleType, setVehicleType] =
    useState<VehicleType>('Car');

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState('');
  const [fuelType, setFuelType] =
    useState<FuelType>('Petrol');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedBrand = brand.trim();
    const trimmedModel = model.trim();
    const trimmedRegistration = registrationNo
      .trim()
      .toUpperCase();

    if (!trimmedBrand) {
      Alert.alert('Required', 'Please enter the vehicle brand.');
      return;
    }

    if (!trimmedModel) {
      Alert.alert('Required', 'Please enter the vehicle model.');
      return;
    }

    if (currentOdometer.trim()) {
      const odometer = Number(currentOdometer);

      if (
        Number.isNaN(odometer) ||
        odometer < 0 ||
        !Number.isInteger(odometer)
      ) {
        Alert.alert(
          'Invalid odometer',
          'Please enter a valid odometer value in kilometres.'
        );
        return;
      }
    }

    if (purchaseDate.trim()) {
      const date = new Date(purchaseDate);

      if (Number.isNaN(date.getTime())) {
        Alert.alert(
          'Invalid date',
          'Please enter the purchase date in YYYY-MM-DD format.'
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);

      await createVehicle({
        vehicleType,
        brand: trimmedBrand,
        model: trimmedModel,
        ...(trimmedRegistration
          ? { registrationNo: trimmedRegistration }
          : {}),
        ...(purchaseDate.trim()
          ? { purchaseDate: purchaseDate.trim() }
          : {}),
        ...(currentOdometer.trim()
          ? { currentOdometer: Number(currentOdometer) }
          : {}),
        fuelType,
      });

      Alert.alert(
        'Vehicle Added',
        'Your vehicle has been added successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/vehicles'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Add vehicle error:', error);

      const message =
        error?.response?.data?.message ||
        'Unable to add your vehicle. Please try again.';

      Alert.alert('Unable to Add Vehicle', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            disabled={isSubmitting}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Add Vehicle</Text>

            <Text style={styles.subtitle}>
              Add your vehicle details to start tracking maintenance.
            </Text>
          </View>
        </View>

        {/* Vehicle Type */}

        <View style={styles.section}>
          <Text style={styles.label}>Vehicle Type *</Text>

          <View style={styles.optionsRow}>
            {vehicleTypes.map((type) => {
              const selected = vehicleType === type;

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.option,
                    selected && styles.optionSelected,
                  ]}
                  onPress={() => setVehicleType(type)}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Brand */}

        <View style={styles.section}>
          <Text style={styles.label}>Brand *</Text>

          <TextInput
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Toyota, Honda, Hyundai"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            autoCapitalize="words"
            editable={!isSubmitting}
          />
        </View>

        {/* Model */}

        <View style={styles.section}>
          <Text style={styles.label}>Model *</Text>

          <TextInput
            value={model}
            onChangeText={setModel}
            placeholder="e.g. City, Creta, Swift"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            autoCapitalize="words"
            editable={!isSubmitting}
          />
        </View>

        {/* Registration */}

        <View style={styles.section}>
          <Text style={styles.label}>Registration Number</Text>

          <TextInput
            value={registrationNo}
            onChangeText={setRegistrationNo}
            placeholder="e.g. MH12AB1234"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isSubmitting}
          />

          <Text style={styles.helperText}>
            Optional. Your registration number will be stored securely.
          </Text>
        </View>

        {/* Purchase Date */}

        <View style={styles.section}>
          <Text style={styles.label}>Purchase Date</Text>

          <TextInput
            value={purchaseDate}
            onChangeText={setPurchaseDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.textSecondary}
            style={styles.input}
            keyboardType="numbers-and-punctuation"
            editable={!isSubmitting}
            maxLength={10}
          />

          <Text style={styles.helperText}>
            Example: 2025-06-15
          </Text>
        </View>

        {/* Odometer */}

        <View style={styles.section}>
          <Text style={styles.label}>
            Current Odometer
          </Text>

          <View style={styles.inputWithSuffix}>
            <TextInput
              value={currentOdometer}
              onChangeText={setCurrentOdometer}
              placeholder="e.g. 24500"
              placeholderTextColor={Colors.textSecondary}
              style={styles.odometerInput}
              keyboardType="number-pad"
              editable={!isSubmitting}
            />

            <Text style={styles.suffix}>km</Text>
          </View>
        </View>

        {/* Fuel Type */}

        <View style={styles.section}>
          <Text style={styles.label}>Fuel Type</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fuelRow}
          >
            {fuelTypes.map((fuel) => {
              const selected = fuelType === fuel;

              return (
                <TouchableOpacity
                  key={fuel}
                  style={[
                    styles.fuelOption,
                    selected && styles.fuelOptionSelected,
                  ]}
                  onPress={() => setFuelType(fuel)}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.fuelText,
                      selected && styles.fuelTextSelected,
                    ]}
                  >
                    {fuel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Submit */}

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="small"
                color={Colors.surface}
              />

              <Text style={styles.submitButtonText}>
                Adding Vehicle...
              </Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              Add Vehicle
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.requiredText}>
          * Required fields
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 14,
  },

  backButtonText: {
    fontSize: 32,
    lineHeight: 34,
    color: Colors.text,
  },

  headerTextContainer: {
    flex: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },

  section: {
    marginBottom: 20,
  },

  label: {
    marginBottom: 9,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    paddingHorizontal: 15,
    fontSize: 15,
    color: Colors.text,
  },

  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  option: {
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },

  optionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },

  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  optionTextSelected: {
    color: Colors.primaryDark,
  },

  inputWithSuffix: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    paddingRight: 15,
  },

  odometerInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 15,
    color: Colors.text,
  },

  suffix: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  fuelRow: {
    gap: 8,
  },

  fuelOption: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },

  fuelOptionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },

  fuelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  fuelTextSelected: {
    color: Colors.primaryDark,
  },

  submitButton: {
    height: 54,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginTop: 8,
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  requiredText: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

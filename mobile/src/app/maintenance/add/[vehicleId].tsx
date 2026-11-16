
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
import { useLocalSearchParams, useRouter } from 'expo-router';

import { createMaintenance } from '../../../services/maintenance.service';

import { Colors } from '@/theme/colors';

const serviceTypes = [
  'General Service',
  'Oil Change',
  'Brake Service',
  'Tyre Replacement',
  'Battery',
  'AC Service',
  'Engine Repair',
  'Other',
];

export default function AddMaintenanceScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    vehicleId: string | string[];
  }>();

  const vehicleId = Array.isArray(params.vehicleId)
    ? params.vehicleId[0]
    : params.vehicleId;

  const [serviceType, setServiceType] =
    useState('General Service');

  const [serviceDate, setServiceDate] = useState('');

  const [odometer, setOdometer] = useState('');

  const [cost, setCost] = useState('');

  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const handleSubmit = async () => {
    if (!vehicleId) {
      Alert.alert(
        'Error',
        'Vehicle information is missing.'
      );
      return;
    }

    if (!serviceDate.trim()) {
      Alert.alert(
        'Required',
        'Please enter the service date.'
      );
      return;
    }

    const parsedDate = new Date(serviceDate);

    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert(
        'Invalid Date',
        'Please use YYYY-MM-DD format.'
      );
      return;
    }

    if (odometer.trim()) {
      const value = Number(odometer);

      if (
        Number.isNaN(value) ||
        value < 0 ||
        !Number.isInteger(value)
      ) {
        Alert.alert(
          'Invalid Odometer',
          'Please enter a valid whole number.'
        );
        return;
      }
    }

    if (cost.trim()) {
      const value = Number(cost);

      if (Number.isNaN(value) || value < 0) {
        Alert.alert(
          'Invalid Cost',
          'Please enter a valid cost.'
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);

      await createMaintenance({
        vehicleId,
        serviceType,
        serviceDate: serviceDate.trim(),
        ...(odometer.trim()
          ? { odometer: Number(odometer) }
          : {}),
        ...(cost.trim()
          ? { cost: Number(cost) }
          : {}),
        ...(notes.trim()
          ? { notes: notes.trim() }
          : {}),
      });

      Alert.alert(
        'Maintenance Added',
        'Maintenance record added successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                `/maintenance/${vehicleId}`
              ),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        'Create maintenance error:',
        error
      );

      const message =
        error?.response?.data?.message ||
        'Unable to add maintenance record.';

      Alert.alert('Unable to Add', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isSubmitting}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Add Maintenance
            </Text>

            <Text style={styles.subtitle}>
              Record a service or repair for your vehicle.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Service Type *
          </Text>

          <View style={styles.options}>
            {serviceTypes.map((type) => {
              const selected =
                serviceType === type;

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.option,
                    selected &&
                      styles.optionSelected,
                  ]}
                  onPress={() =>
                    setServiceType(type)
                  }
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected &&
                        styles.optionTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Service Date *
          </Text>

          <TextInput
            value={serviceDate}
            onChangeText={setServiceDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={
              Colors.textSecondary
            }
            style={styles.input}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            editable={!isSubmitting}
          />

          <Text style={styles.helperText}>
            Example: 2026-10-15
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Odometer
          </Text>

          <View style={styles.inputWithSuffix}>
            <TextInput
              value={odometer}
              onChangeText={setOdometer}
              placeholder="e.g. 25000"
              placeholderTextColor={
                Colors.textSecondary
              }
              style={styles.suffixInput}
              keyboardType="number-pad"
              editable={!isSubmitting}
            />

            <Text style={styles.suffix}>
              km
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Cost
          </Text>

          <View style={styles.inputWithPrefix}>
            <Text style={styles.prefix}>₹</Text>

            <TextInput
              value={cost}
              onChangeText={setCost}
              placeholder="e.g. 4500"
              placeholderTextColor={
                Colors.textSecondary
              }
              style={styles.costInput}
              keyboardType="decimal-pad"
              editable={!isSubmitting}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Notes
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional details..."
            placeholderTextColor={
              Colors.textSecondary
            }
            style={styles.notesInput}
            multiline
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting &&
              styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator
                size="small"
                color={Colors.surface}
              />

              <Text style={styles.submitText}>
                Saving...
              </Text>
            </View>
          ) : (
            <Text style={styles.submitText}>
              Add Maintenance
            </Text>
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

  content: {
    padding: 20,
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

  backText: {
    fontSize: 32,
    lineHeight: 34,
    color: Colors.text,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: '700',
    color: Colors.text,
  },

  subtitle: {
    marginTop: 5,
    lineHeight: 20,
    fontSize: 13,
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

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  option: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  optionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },

  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  optionTextSelected: {
    color: Colors.primaryDark,
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

  inputWithSuffix: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingRight: 15,
  },

  suffixInput: {
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

  inputWithPrefix: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },

  prefix: {
    paddingLeft: 15,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  costInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontSize: 15,
    color: Colors.text,
  },

  notesInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    padding: 15,
    fontSize: 15,
    color: Colors.text,
  },

  submitButton: {
    height: 54,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginTop: 8,
  },

  disabledButton: {
    opacity: 0.7,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  submitText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});


import { useCallback, useEffect, useState } from 'react';
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

import {
  deleteVehicle,
  getVehicleById,
  updateVehicle,
  Vehicle,
} from '../../services/vehicle.service';

import { Colors } from '@/theme/colors';

type VehicleType = 'Car' | 'Bike' | 'Scooter' | 'Other';
type FuelType =
  | 'Petrol'
  | 'Diesel'
  | 'CNG'
  | 'Electric'
  | 'Hybrid'
  | 'Other';

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

export default function VehicleDetailsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id: string | string[];
  }>();

  const vehicleId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [vehicleType, setVehicleType] =
    useState<VehicleType>('Car');

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState('');
  const [fuelType, setFuelType] =
    useState<FuelType>('Petrol');

  const loadVehicle = useCallback(async () => {
    if (!vehicleId) {
      return;
    }

    try {
      setIsLoading(true);

      const data = await getVehicleById(vehicleId);

      setVehicle(data);

      setVehicleType(
        (data.vehicleType as VehicleType) || 'Car'
      );

      setBrand(data.brand || '');
      setModel(data.model || '');
      setRegistrationNo(data.registrationNo || '');

      setPurchaseDate(
        data.purchaseDate
          ? data.purchaseDate.substring(0, 10)
          : ''
      );

      setCurrentOdometer(
        data.currentOdometer !== null &&
          data.currentOdometer !== undefined
          ? String(data.currentOdometer)
          : ''
      );

      setFuelType(
        (data.fuelType as FuelType) || 'Petrol'
      );
    } catch (error) {
      console.error('Load vehicle error:', error);

      Alert.alert(
        'Unable to Load Vehicle',
        'We could not load this vehicle. Please try again.',
        [
          {
            text: 'Go Back',
            onPress: () => router.back(),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  }, [vehicleId, router]);

  useEffect(() => {
    loadVehicle();
  }, [loadVehicle]);

  const handleStartEditing = () => {
    if (!vehicle) {
      return;
    }

    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (!vehicle) {
      return;
    }

    setVehicleType(
      (vehicle.vehicleType as VehicleType) || 'Car'
    );

    setBrand(vehicle.brand || '');
    setModel(vehicle.model || '');
    setRegistrationNo(vehicle.registrationNo || '');

    setPurchaseDate(
      vehicle.purchaseDate
        ? vehicle.purchaseDate.substring(0, 10)
        : ''
    );

    setCurrentOdometer(
      vehicle.currentOdometer !== null &&
        vehicle.currentOdometer !== undefined
        ? String(vehicle.currentOdometer)
        : ''
    );

    setFuelType(
      (vehicle.fuelType as FuelType) || 'Petrol'
    );

    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!vehicleId) {
      return;
    }

    const trimmedBrand = brand.trim();
    const trimmedModel = model.trim();
    const trimmedRegistration = registrationNo
      .trim()
      .toUpperCase();

    if (!trimmedBrand) {
      Alert.alert(
        'Required',
        'Please enter the vehicle brand.'
      );
      return;
    }

    if (!trimmedModel) {
      Alert.alert(
        'Required',
        'Please enter the vehicle model.'
      );
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
          'Invalid Odometer',
          'Please enter a valid odometer value.'
        );
        return;
      }
    }

    if (purchaseDate.trim()) {
      const date = new Date(purchaseDate);

      if (Number.isNaN(date.getTime())) {
        Alert.alert(
          'Invalid Date',
          'Please use YYYY-MM-DD format.'
        );
        return;
      }
    }

    try {
      setIsSaving(true);

      const updatedVehicle = await updateVehicle(
        vehicleId,
        {
          vehicleType,
          brand: trimmedBrand,
          model: trimmedModel,
          registrationNo: trimmedRegistration || '',
          purchaseDate: purchaseDate.trim(),
          currentOdometer: currentOdometer.trim()
            ? Number(currentOdometer)
            : undefined,
          fuelType,
        }
      );

      setVehicle(updatedVehicle);

      setIsEditing(false);

      Alert.alert(
        'Vehicle Updated',
        'Your vehicle details have been updated successfully.'
      );
    } catch (error: any) {
      console.error('Update vehicle error:', error);

      const message =
        error?.response?.data?.message ||
        'Unable to update the vehicle. Please try again.';

      Alert.alert('Update Failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!vehicleId) {
      return;
    }

    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle? All maintenance records associated with this vehicle may also be deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!vehicleId) {
      return;
    }

    try {
      setIsDeleting(true);

      await deleteVehicle(vehicleId);

      Alert.alert(
        'Vehicle Deleted',
        'The vehicle has been deleted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/vehicles');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Delete vehicle error:', error);

      const message =
        error?.response?.data?.message ||
        'Unable to delete the vehicle. Please try again.';

      Alert.alert('Delete Failed', message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading vehicle...
        </Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Vehicle not found
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace('/vehicles')}
        >
          <Text style={styles.primaryButtonText}>
            Back to Vehicles
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              isEditing
                ? handleCancelEditing()
                : router.back()
            }
            disabled={isSaving || isDeleting}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              {isEditing
                ? 'Edit Vehicle'
                : 'Vehicle Details'}
            </Text>

            <Text style={styles.subtitle}>
              {isEditing
                ? 'Update your vehicle information'
                : 'View and manage your vehicle'}
            </Text>
          </View>

          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleStartEditing}
              disabled={isDeleting}
            >
              <Text style={styles.editButtonText}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Vehicle Hero */}

        <View style={styles.heroCard}>
          <View style={styles.vehicleIcon}>
            <Text style={styles.vehicleIconText}>
              🚗
            </Text>
          </View>

          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>
              {vehicle.brand} {vehicle.model}
            </Text>

            <Text style={styles.heroType}>
              {vehicle.vehicleType}
            </Text>
          </View>
        </View>

        {isEditing ? (
          <>
            {/* Vehicle Type */}

            <View style={styles.section}>
              <Text style={styles.label}>
                Vehicle Type
              </Text>

              <View style={styles.optionsRow}>
                {vehicleTypes.map((type) => {
                  const selected =
                    vehicleType === type;

                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.option,
                        selected &&
                        styles.optionSelected,
                      ]}
                      onPress={() =>
                        setVehicleType(type)
                      }
                      disabled={isSaving}
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

            {/* Brand */}

            <View style={styles.section}>
              <Text style={styles.label}>
                Brand *
              </Text>

              <TextInput
                value={brand}
                onChangeText={setBrand}
                placeholder="Vehicle brand"
                placeholderTextColor={
                  Colors.textSecondary
                }
                style={styles.input}
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            {/* Model */}

            <View style={styles.section}>
              <Text style={styles.label}>
                Model *
              </Text>

              <TextInput
                value={model}
                onChangeText={setModel}
                placeholder="Vehicle model"
                placeholderTextColor={
                  Colors.textSecondary
                }
                style={styles.input}
                autoCapitalize="words"
                editable={!isSaving}
              />
            </View>

            {/* Registration */}

            <View style={styles.section}>
              <Text style={styles.label}>
                Registration Number
              </Text>

              <TextInput
                value={registrationNo}
                onChangeText={setRegistrationNo}
                placeholder="e.g. MH12AB1234"
                placeholderTextColor={
                  Colors.textSecondary
                }
                style={styles.input}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isSaving}
              />
            </View>

            {/* Purchase Date */}

            <View style={styles.section}>
              <Text style={styles.label}>
                Purchase Date
              </Text>

              <TextInput
                value={purchaseDate}
                onChangeText={setPurchaseDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={
                  Colors.textSecondary
                }
                style={styles.input}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                editable={!isSaving}
              />
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
                  placeholderTextColor={
                    Colors.textSecondary
                  }
                  style={styles.odometerInput}
                  keyboardType="number-pad"
                  editable={!isSaving}
                />

                <Text style={styles.suffix}>
                  km
                </Text>
              </View>
            </View>

            {/* Fuel */}

            <View style={styles.section}>
              <Text style={styles.label}>
                Fuel Type
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.fuelRow}
              >
                {fuelTypes.map((fuel) => {
                  const selected =
                    fuelType === fuel;

                  return (
                    <TouchableOpacity
                      key={fuel}
                      style={[
                        styles.fuelOption,
                        selected &&
                        styles.fuelOptionSelected,
                      ]}
                      onPress={() =>
                        setFuelType(fuel)
                      }
                      disabled={isSaving}
                    >
                      <Text
                        style={[
                          styles.fuelText,
                          selected &&
                          styles.fuelTextSelected,
                        ]}
                      >
                        {fuel}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Save */}

            <TouchableOpacity
              style={[
                styles.primaryButton,
                isSaving &&
                styles.disabledButton,
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator
                    size="small"
                    color={Colors.surface}
                  />

                  <Text
                    style={styles.primaryButtonText}
                  >
                    Saving...
                  </Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEditing}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Details */}

            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>
                Vehicle Information
              </Text>

              <DetailRow
                label="Vehicle Type"
                value={vehicle.vehicleType}
              />

              <DetailRow
                label="Brand"
                value={vehicle.brand}
              />

              <DetailRow
                label="Model"
                value={vehicle.model}
              />

              <DetailRow
                label="Registration Number"
                value={
                  vehicle.registrationNo || 'Not provided'
                }
              />

              <DetailRow
                label="Purchase Date"
                value={
                  vehicle.purchaseDate
                    ? vehicle.purchaseDate.substring(
                      0,
                      10
                    )
                    : 'Not provided'
                }
              />

              <DetailRow
                label="Current Odometer"
                value={
                  vehicle.currentOdometer !== null &&
                    vehicle.currentOdometer !==
                    undefined
                    ? `${vehicle.currentOdometer.toLocaleString()} km`
                    : 'Not provided'
                }
              />

              <DetailRow
                label="Fuel Type"
                value={
                  vehicle.fuelType || 'Not provided'
                }
                last
              />
            </View>

            {/* Maintenance Placeholder */}

            <View style={styles.nextFeatureCard}>
              <Text style={styles.nextFeatureIcon}>
                📄
              </Text>

              <View style={styles.nextFeatureContent}>
                <Text style={styles.nextFeatureTitle}>
                  Documents
                </Text>

                <Text style={styles.nextFeatureText}>
                  Manage insurance, PUC, registration and other
                  vehicle documents and expiry dates.
                </Text>

                <TouchableOpacity
                  style={styles.maintenanceButton}
                  onPress={() =>
                    router.push(`/documents/${vehicle.id}`)
                  }
                >
                  <Text style={styles.maintenanceButtonText}>
                    View Documents
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Delete */}

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.danger}
                />
              ) : (
                <Text style={styles.deleteButtonText}>
                  Delete Vehicle
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.detailRow,
        last && styles.detailRowLast,
      ]}
    >
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
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

  maintenanceButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: Colors.primary,
  },

  maintenanceButtonText: {
    color: Colors.surface,
    fontSize: 13,
    fontWeight: '700',
  },

  
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 22,
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
    fontSize: 25,
    fontWeight: '700',
    color: Colors.text,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: Colors.primaryLight,
  },

  editButtonText: {
    color: Colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },

  vehicleIcon: {
    width: 62,
    height: 62,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginRight: 16,
  },

  vehicleIconText: {
    fontSize: 30,
  },

  heroInfo: {
    flex: 1,
  },

  heroName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.surface,
  },

  heroType: {
    marginTop: 5,
    fontSize: 14,
    color: Colors.primaryLight,
  },

  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 18,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    paddingTop: 18,
    paddingBottom: 4,
  },

  detailRow: {
    minHeight: 58,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  detailRowLast: {
    borderBottomWidth: 0,
  },

  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },

  nextFeatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    padding: 18,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
  },

  nextFeatureIcon: {
    fontSize: 28,
    marginRight: 14,
  },

  nextFeatureContent: {
    flex: 1,
  },

  nextFeatureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primaryDark,
  },

  nextFeatureText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },

  deleteButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  deleteButtonText: {
    color: Colors.danger,
    fontSize: 15,
    fontWeight: '700',
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

  primaryButton: {
    height: 54,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginTop: 8,
  },

  primaryButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.7,
  },

  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  cancelButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 10,
  },

  cancelButtonText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
});

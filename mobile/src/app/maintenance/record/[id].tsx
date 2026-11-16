
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
  deleteMaintenance,
  getMaintenanceById,
  MaintenanceRecord,
  updateMaintenance,
} from '../../../services/maintenance.service';

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

const formatDate = (date: string) => {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date.substring(0, 10);
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCost = (
  cost: string | number | null | undefined
) => {
  if (cost === null || cost === undefined || cost === '') {
    return '₹0';
  }

  const value = Number(cost);

  if (Number.isNaN(value)) {
    return `₹${cost}`;
  }

  return `₹${value.toLocaleString('en-IN')}`;
};

export default function MaintenanceRecordScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id: string | string[];
  }>();

  const recordId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [record, setRecord] =
    useState<MaintenanceRecord | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [serviceType, setServiceType] =
    useState('General Service');

  const [serviceDate, setServiceDate] = useState('');
  const [odometer, setOdometer] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');

  const loadRecord = useCallback(async () => {
    if (!recordId) {
      return;
    }

    try {
      setIsLoading(true);

      const data =
        await getMaintenanceById(recordId);

      setRecord(data);

      setServiceType(data.serviceType);
      setServiceDate(
        data.serviceDate.substring(0, 10)
      );

      setOdometer(
        data.odometer !== null &&
          data.odometer !== undefined
          ? String(data.odometer)
          : ''
      );

      setCost(
        data.cost !== null &&
          data.cost !== undefined
          ? String(data.cost)
          : ''
      );

      setNotes(data.notes || '');
    } catch (error) {
      console.error(
        'Load maintenance error:',
        error
      );

      Alert.alert(
        'Unable to Load',
        'Maintenance record could not be loaded.',
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
  }, [recordId, router]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  const handleCancel = () => {
    if (!record) {
      return;
    }

    setServiceType(record.serviceType);

    setServiceDate(
      record.serviceDate.substring(0, 10)
    );

    setOdometer(
      record.odometer !== null &&
        record.odometer !== undefined
        ? String(record.odometer)
        : ''
    );

    setCost(
      record.cost !== null &&
        record.cost !== undefined
        ? String(record.cost)
        : ''
    );

    setNotes(record.notes || '');

    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!recordId) {
      return;
    }

    if (!serviceType.trim()) {
      Alert.alert(
        'Required',
        'Please select a service type.'
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
      setIsSaving(true);

      const updated =
        await updateMaintenance(recordId, {
          serviceType: serviceType.trim(),
          serviceDate: serviceDate.trim(),
          odometer: odometer.trim()
            ? Number(odometer)
            : null,
          cost: cost.trim()
            ? Number(cost)
            : null,
          notes: notes.trim() || null,
        });

      setRecord(updated);
      setIsEditing(false);

      Alert.alert(
        'Updated',
        'Maintenance record updated successfully.'
      );
    } catch (error: any) {
      console.error(
        'Update maintenance error:',
        error
      );

      const message =
        error?.response?.data?.message ||
        'Unable to update maintenance record.';

      Alert.alert('Update Failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Maintenance',
      'Are you sure you want to delete this maintenance record?',
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
    if (!recordId || !record) {
      return;
    }

    try {
      setIsDeleting(true);

      await deleteMaintenance(recordId);

      Alert.alert(
        'Deleted',
        'Maintenance record deleted successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                `/maintenance/${record.vehicleId}`
              ),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        'Delete maintenance error:',
        error
      );

      const message =
        error?.response?.data?.message ||
        'Unable to delete maintenance record.';

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
          Loading record...
        </Text>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Record not found
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() =>
              isEditing
                ? handleCancel()
                : router.back()
            }
            disabled={isSaving || isDeleting}
          >
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              {isEditing
                ? 'Edit Maintenance'
                : 'Maintenance Details'}
            </Text>

            <Text style={styles.subtitle}>
              {isEditing
                ? 'Update service information'
                : 'View service information'}
            </Text>
          </View>

          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
              disabled={isDeleting}
            >
              <Text style={styles.editText}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!isEditing ? (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroIcon}>
                🔧
              </Text>

              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>
                  {record.serviceType}
                </Text>

                <Text style={styles.heroDate}>
                  {formatDate(record.serviceDate)}
                </Text>
              </View>

              <Text style={styles.heroCost}>
                {formatCost(record.cost)}
              </Text>
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>
                Service Information
              </Text>

              <DetailRow
                label="Service Type"
                value={record.serviceType}
              />

              <DetailRow
                label="Service Date"
                value={formatDate(
                  record.serviceDate
                )}
              />

              <DetailRow
                label="Odometer"
                value={
                  record.odometer !== null &&
                  record.odometer !== undefined
                    ? `${record.odometer.toLocaleString()} km`
                    : 'Not provided'
                }
              />

              <DetailRow
                label="Cost"
                value={formatCost(record.cost)}
              />

              <DetailRow
                label="Notes"
                value={
                  record.notes || 'No notes added'
                }
                last
              />
            </View>

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
                <Text style={styles.deleteText}>
                  Delete Maintenance
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
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
                maxLength={10}
                keyboardType="numbers-and-punctuation"
                editable={!isSaving}
              />
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
                  editable={!isSaving}
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
                <Text style={styles.prefix}>
                  ₹
                </Text>

                <TextInput
                  value={cost}
                  onChangeText={setCost}
                  placeholder="e.g. 4500"
                  placeholderTextColor={
                    Colors.textSecondary
                  }
                  style={styles.costInput}
                  keyboardType="decimal-pad"
                  editable={!isSaving}
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
                placeholder="Additional details..."
                placeholderTextColor={
                  Colors.textSecondary
                }
                style={styles.notesInput}
                multiline
                textAlignVertical="top"
                editable={!isSaving}
              />
            </View>

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
                <Text
                  style={styles.primaryButtonText}
                >
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
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
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },

  loadingText: {
    marginTop: 12,
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
    marginRight: 12,
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

  editText: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },

  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
  },

  heroIcon: {
    fontSize: 32,
    marginRight: 14,
  },

  heroInfo: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.surface,
  },

  heroDate: {
    marginTop: 5,
    fontSize: 13,
    color: Colors.primaryLight,
  },

  heroCost: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.surface,
  },

  detailsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 18,
  },

  cardTitle: {
    paddingTop: 18,
    paddingBottom: 5,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
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

  deleteButton: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  deleteText: {
    color: Colors.danger,
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
    color: Colors.text,
  },

  suffix: {
    color: Colors.textSecondary,
    fontWeight: '600',
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
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  costInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    color: Colors.text,
  },

  notesInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    padding: 15,
    color: Colors.text,
    fontSize: 15,
  },

  primaryButton: {
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

  primaryButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },

  cancelButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginTop: 10,
  },

  cancelText: {
    fontWeight: '600',
    color: Colors.text,
  },
});

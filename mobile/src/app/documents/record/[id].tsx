
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
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  deleteDocument,
  getDocumentById,
  updateDocument,
  VehicleDocument,
} from '../../../services/document.service';

import { Colors } from '@/theme/colors';

const documentTypes = [
  'Insurance',
  'PUC',
  'Registration',
  'Driving Licence',
  'Other',
];

const formatDate = (date: string | null | undefined) => {
  if (!date) {
    return 'Not provided';
  }

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

const getExpiryStatus = (expiryDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diff =
    expiry.getTime() - today.getTime();

  const days = Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );

  if (days < 0) {
    return {
      label: 'Expired',
      type: 'expired',
    };
  }

  if (days <= 30) {
    return {
      label: 'Expiring Soon',
      type: 'warning',
    };
  }

  return {
    label: 'Valid',
    type: 'valid',
  };
};

const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'Insurance':
      return '🛡️';

    case 'PUC':
      return '🌿';

    case 'Registration':
      return '📋';

    case 'Driving Licence':
      return '🪪';

    default:
      return '📄';
  }
};

export default function DocumentRecordScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    id: string | string[];
  }>();

  const recordId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [document, setDocument] =
    useState<VehicleDocument | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [documentType, setDocumentType] =
    useState('Insurance');

  const [documentNumber, setDocumentNumber] =
    useState('');

  const [issueDate, setIssueDate] = useState('');

  const [expiryDate, setExpiryDate] = useState('');

  const [notes, setNotes] = useState('');

  const loadDocument = useCallback(async () => {
    if (!recordId) {
      return;
    }

    try {
      setIsLoading(true);

      const data =
        await getDocumentById(recordId);

      setDocument(data);

      setDocumentType(data.documentType);
      setDocumentNumber(
        data.documentNumber || ''
      );

      setIssueDate(
        data.issueDate
          ? data.issueDate.substring(0, 10)
          : ''
      );

      setExpiryDate(
        data.expiryDate.substring(0, 10)
      );

      setNotes(data.notes || '');
    } catch (error) {
      console.error(
        'Load document error:',
        error
      );

      Alert.alert(
        'Unable to Load',
        'Document could not be loaded.',
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
    loadDocument();
  }, [loadDocument]);

  const handleCancel = () => {
    if (!document) {
      return;
    }

    setDocumentType(document.documentType);

    setDocumentNumber(
      document.documentNumber || ''
    );

    setIssueDate(
      document.issueDate
        ? document.issueDate.substring(0, 10)
        : ''
    );

    setExpiryDate(
      document.expiryDate.substring(0, 10)
    );

    setNotes(document.notes || '');

    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!recordId) {
      return;
    }

    if (!documentType.trim()) {
      Alert.alert(
        'Required',
        'Please select a document type.'
      );
      return;
    }

    if (!expiryDate.trim()) {
      Alert.alert(
        'Required',
        'Please enter the expiry date.'
      );
      return;
    }

    const parsedExpiryDate = new Date(
      expiryDate.trim()
    );

    if (Number.isNaN(parsedExpiryDate.getTime())) {
      Alert.alert(
        'Invalid Date',
        'Please use YYYY-MM-DD format.'
      );
      return;
    }

    if (issueDate.trim()) {
      const parsedIssueDate = new Date(
        issueDate.trim()
      );

      if (Number.isNaN(parsedIssueDate.getTime())) {
        Alert.alert(
          'Invalid Date',
          'Please use YYYY-MM-DD format.'
        );
        return;
      }

      if (parsedIssueDate > parsedExpiryDate) {
        Alert.alert(
          'Invalid Dates',
          'Issue date cannot be after expiry date.'
        );
        return;
      }
    }

    try {
      setIsSaving(true);

      const updated =
        await updateDocument(recordId, {
          documentType: documentType.trim(),
          documentNumber:
            documentNumber.trim() || null,
          issueDate:
            issueDate.trim() || null,
          expiryDate: expiryDate.trim(),
          notes: notes.trim() || null,
        });

      setDocument(updated);
      setIsEditing(false);

      Alert.alert(
        'Updated',
        'Document updated successfully.'
      );
    } catch (error: any) {
      console.error(
        'Update document error:',
        error
      );

      const message =
        error?.response?.data?.message ||
        'Unable to update document.';

      Alert.alert(
        'Update Failed',
        message
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
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
    if (!recordId || !document) {
      return;
    }

    try {
      setIsDeleting(true);

      await deleteDocument(recordId);

      Alert.alert(
        'Deleted',
        'Document deleted successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                `/documents/${document.vehicleId}`
              ),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        'Delete document error:',
        error
      );

      const message =
        error?.response?.data?.message ||
        'Unable to delete document.';

      Alert.alert(
        'Delete Failed',
        message
      );
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
          Loading document...
        </Text>
      </View>
    );
  }

  if (!document) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Document not found
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

  const status = getExpiryStatus(
    document.expiryDate
  );

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
                ? 'Edit Document'
                : 'Document Details'}
            </Text>

            <Text style={styles.subtitle}>
              {isEditing
                ? 'Update document information'
                : 'View document information'}
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
                {getDocumentIcon(
                  document.documentType
                )}
              </Text>

              <View style={styles.heroInfo}>
                <Text style={styles.heroTitle}>
                  {document.documentType}
                </Text>

                <Text
                  style={[
                    styles.heroStatus,
                    status.type === 'valid' &&
                      styles.validText,
                    status.type === 'warning' &&
                      styles.warningText,
                    status.type === 'expired' &&
                      styles.expiredText,
                  ]}
                >
                  {status.label}
                </Text>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <Text style={styles.cardTitle}>
                Document Information
              </Text>

              <DetailRow
                label="Document Type"
                value={document.documentType}
              />

              <DetailRow
                label="Document Number"
                value={
                  document.documentNumber ||
                  'Not provided'
                }
              />

              <DetailRow
                label="Issue Date"
                value={formatDate(
                  document.issueDate
                )}
              />

              <DetailRow
                label="Expiry Date"
                value={formatDate(
                  document.expiryDate
                )}
              />

              <DetailRow
                label="Notes"
                value={
                  document.notes ||
                  'No notes added'
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
                  Delete Document
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>
                Document Type *
              </Text>

              <View style={styles.options}>
                {documentTypes.map((type) => {
                  const selected =
                    documentType === type;

                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.option,
                        selected &&
                          styles.optionSelected,
                      ]}
                      onPress={() =>
                        setDocumentType(type)
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
                Document Number
              </Text>

              <TextInput
                value={documentNumber}
                onChangeText={setDocumentNumber}
                placeholder="Document number"
                placeholderTextColor={
                  Colors.textSecondary
                }
                style={styles.input}
                autoCapitalize="characters"
                editable={!isSaving}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>
                Issue Date
              </Text>

              <TextInput
                value={issueDate}
                onChangeText={setIssueDate}
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
                Expiry Date *
              </Text>

              <TextInput
                value={expiryDate}
                onChangeText={setExpiryDate}
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
                Notes
              </Text>

              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Additional information..."
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
    fontSize: 34,
    marginRight: 15,
  },

  heroInfo: {
    flex: 1,
  },

  heroTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.surface,
  },

  heroStatus: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
  },

  validText: {
    color: Colors.success,
  },

  warningText: {
    color: Colors.warning,
  },

  expiredText: {
    color: Colors.danger,
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

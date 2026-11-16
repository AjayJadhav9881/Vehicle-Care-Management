
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
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { createDocument } from '../../../services/document.service';

import { Colors } from '@/theme/colors';

const documentTypes = [
  'Insurance',
  'PUC',
  'Registration',
  'Driving Licence',
  'Other',
];

export default function AddDocumentScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    vehicleId: string | string[];
  }>();

  const vehicleId = Array.isArray(params.vehicleId)
    ? params.vehicleId[0]
    : params.vehicleId;

  const [documentType, setDocumentType] =
    useState('Insurance');

  const [documentNumber, setDocumentNumber] =
    useState('');

  const [issueDate, setIssueDate] = useState('');

  const [expiryDate, setExpiryDate] = useState('');

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
        'Please use YYYY-MM-DD format for the expiry date.'
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
          'Please use YYYY-MM-DD format for the issue date.'
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
      setIsSubmitting(true);

      await createDocument({
        vehicleId,
        documentType,
        ...(documentNumber.trim()
          ? {
              documentNumber:
                documentNumber.trim(),
            }
          : {}),
        ...(issueDate.trim()
          ? {
              issueDate: issueDate.trim(),
            }
          : {}),
        expiryDate: expiryDate.trim(),
        ...(notes.trim()
          ? {
              notes: notes.trim(),
            }
          : {}),
      });

      Alert.alert(
        'Document Added',
        'Document added successfully.',
        [
          {
            text: 'OK',
            onPress: () =>
              router.replace(
                `/documents/${vehicleId}`
              ),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        'Create document error:',
        error
      );

      const message =
        error?.response?.data?.message ||
        'Unable to add document.';

      Alert.alert(
        'Unable to Add',
        message
      );
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
              Add Document
            </Text>

            <Text style={styles.subtitle}>
              Add your vehicle document and expiry
              information.
            </Text>
          </View>
        </View>

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
            Document Number
          </Text>

          <TextInput
            value={documentNumber}
            onChangeText={setDocumentNumber}
            placeholder="e.g. policy or certificate number"
            placeholderTextColor={
              Colors.textSecondary
            }
            style={styles.input}
            autoCapitalize="characters"
            editable={!isSubmitting}
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
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            editable={!isSubmitting}
          />

          <Text style={styles.helperText}>
            Optional
          </Text>
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
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            editable={!isSubmitting}
          />

          <Text style={styles.helperText}>
            Example: 2027-10-15
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Notes
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any additional information..."
            placeholderTextColor={
              Colors.textSecondary
            }
            style={styles.notesInput}
            multiline
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>
            💡
          </Text>

          <Text style={styles.infoText}>
            We'll use the expiry date later to send
            reminders before your document expires.
          </Text>
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
              Add Document
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

  infoBox: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    marginBottom: 20,
  },

  infoIcon: {
    fontSize: 18,
    marginRight: 9,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.primaryDark,
  },

  submitButton: {
    height: 54,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
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

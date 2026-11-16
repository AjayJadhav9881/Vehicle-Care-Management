
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  getDocumentsByVehicle,
  VehicleDocument,
} from '../../services/document.service';

import { Colors } from '@/theme/colors';

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

export default function DocumentsScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    vehicleId: string | string[];
  }>();

  const vehicleId = Array.isArray(params.vehicleId)
    ? params.vehicleId[0]
    : params.vehicleId;

  const [documents, setDocuments] = useState<
    VehicleDocument[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const loadDocuments = async () => {
    if (!vehicleId) {
      return;
    }

    try {
      const data =
        await getDocumentsByVehicle(vehicleId);

      setDocuments(data);
    } catch (error) {
      console.error(
        'Load documents error:',
        error
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [vehicleId])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDocuments();
  };

  const expiredCount = documents.filter(
    (item) =>
      getExpiryStatus(item.expiryDate).type ===
      'expired'
  ).length;

  const warningCount = documents.filter(
    (item) =>
      getExpiryStatus(item.expiryDate).type ===
      'warning'
  ).length;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading documents...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Documents
          </Text>

          <Text style={styles.subtitle}>
            Keep your vehicle documents organized
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push(
              `/documents/add/${vehicleId}`
            )
          }
        >
          <Text style={styles.addButtonText}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      {documents.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {documents.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Documents
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryValue,
                expiredCount > 0 &&
                  styles.expiredSummary,
              ]}
            >
              {expiredCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Expired
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text
              style={[
                styles.summaryValue,
                warningCount > 0 &&
                  styles.warningSummary,
              ]}
            >
              {warningCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Due Soon
            </Text>
          </View>
        </View>
      )}

      {documents.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>
              📄
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            No documents yet
          </Text>

          <Text style={styles.emptyText}>
            Add insurance, PUC, registration and other
            vehicle documents to keep track of expiry
            dates.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.push(
                `/documents/add/${vehicleId}`
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              Add Document
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const status =
              getExpiryStatus(item.expiryDate);

            return (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.8}
                onPress={() =>
                  router.push(
                    `/documents/record/${item.id}`
                  )
                }
              >
                <View style={styles.cardHeader}>
                  <View style={styles.documentIcon}>
                    <Text
                      style={styles.documentIconText}
                    >
                      {getDocumentIcon(
                        item.documentType
                      )}
                    </Text>
                  </View>

                  <View style={styles.documentInfo}>
                    <Text style={styles.documentType}>
                      {item.documentType}
                    </Text>

                    {item.documentNumber && (
                      <Text
                        style={styles.documentNumber}
                      >
                        {item.documentNumber}
                      </Text>
                    )}
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      status.type === 'valid' &&
                        styles.validBadge,
                      status.type === 'warning' &&
                        styles.warningBadge,
                      status.type === 'expired' &&
                        styles.expiredBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
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

                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.footerLabel}>
                      Expiry Date
                    </Text>

                    <Text style={styles.expiryDate}>
                      {formatDate(item.expiryDate)}
                    </Text>
                  </View>

                  <Text style={styles.viewText}>
                    View →
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
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

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
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
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  addButtonText: {
    color: Colors.surface,
    fontWeight: '700',
  },

  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark,
    borderRadius: 16,
    paddingVertical: 16,
    marginBottom: 18,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.surface,
  },

  summaryLabel: {
    marginTop: 4,
    fontSize: 11,
    color: Colors.primaryLight,
  },

  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor: Colors.primaryLight,
    opacity: 0.4,
  },

  expiredSummary: {
    color: Colors.danger,
  },

  warningSummary: {
    color: Colors.warning,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 70,
  },

  emptyIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginBottom: 18,
  },

  emptyIconText: {
    fontSize: 34,
  },

  emptyTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: Colors.text,
  },

  emptyText: {
    marginTop: 9,
    textAlign: 'center',
    lineHeight: 20,
    color: Colors.textSecondary,
  },

  primaryButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },

  primaryButtonText: {
    color: Colors.surface,
    fontWeight: '700',
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 13,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginRight: 12,
  },

  documentIconText: {
    fontSize: 23,
  },

  documentInfo: {
    flex: 1,
  },

  documentType: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },

  documentNumber: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  validBadge: {
    backgroundColor: Colors.primaryLight,
  },

  warningBadge: {
    backgroundColor: '#FFF3E3',
  },

  expiredBadge: {
    backgroundColor: '#FCEAEA',
  },

  statusText: {
    fontSize: 10,
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

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  footerLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },

  expiryDate: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },

  viewText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});

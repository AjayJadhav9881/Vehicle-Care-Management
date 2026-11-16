
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
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import {
  getMaintenanceByVehicle,
  MaintenanceRecord,
} from '../../services/maintenance.service';

import { Colors } from '@/theme/colors';

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

  const amount = Number(cost);

  if (Number.isNaN(amount)) {
    return `₹${cost}`;
  }

  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function MaintenanceHistoryScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    vehicleId: string | string[];
  }>();

  const vehicleId = Array.isArray(params.vehicleId)
    ? params.vehicleId[0]
    : params.vehicleId;

  const [records, setRecords] = useState<
    MaintenanceRecord[]
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRecords = async () => {
    if (!vehicleId) {
      return;
    }

    try {
      const data =
        await getMaintenanceByVehicle(vehicleId);

      setRecords(data);
    } catch (error) {
      console.error(
        'Load maintenance records error:',
        error
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [vehicleId])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRecords();
  };

  const totalCost = records.reduce(
    (total, item) => {
      const cost = Number(item.cost || 0);

      return total + (Number.isNaN(cost) ? 0 : cost);
    },
    0
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading maintenance...
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
            Maintenance
          </Text>

          <Text style={styles.subtitle}>
            Service and repair history
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push(
              `/maintenance/add/${vehicleId}`
            )
          }
        >
          <Text style={styles.addButtonText}>
            + Add
          </Text>
        </TouchableOpacity>
      </View>

      {records.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {records.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Services
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {formatCost(totalCost)}
            </Text>

            <Text style={styles.summaryLabel}>
              Total Cost
            </Text>
          </View>
        </View>
      )}

      {records.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>
              🔧
            </Text>
          </View>

          <Text style={styles.emptyTitle}>
            No maintenance records
          </Text>

          <Text style={styles.emptyText}>
            Start tracking your vehicle's services,
            repairs and maintenance expenses.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              router.push(
                `/maintenance/add/${vehicleId}`
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              Add Maintenance
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={records}
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
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                router.push(
                  `/maintenance/record/${item.id}`
                )
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.serviceIcon}>
                  <Text style={styles.serviceIconText}>
                    🔧
                  </Text>
                </View>

                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceType}>
                    {item.serviceType}
                  </Text>

                  <Text style={styles.serviceDate}>
                    {formatDate(item.serviceDate)}
                  </Text>
                </View>

                <Text style={styles.cost}>
                  {formatCost(item.cost)}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.footerText}>
                  {item.odometer !== null &&
                  item.odometer !== undefined
                    ? `${item.odometer.toLocaleString()} km`
                    : 'Odometer not provided'}
                </Text>

                <Text style={styles.detailsText}>
                  View →
                </Text>
              </View>
            </TouchableOpacity>
          )}
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
    paddingVertical: 18,
    marginBottom: 18,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryValue: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.surface,
  },

  summaryLabel: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.primaryLight,
  },

  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.primaryLight,
    opacity: 0.4,
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
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 17,
    marginBottom: 13,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginRight: 12,
  },

  serviceIconText: {
    fontSize: 23,
  },

  serviceInfo: {
    flex: 1,
  },

  serviceType: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },

  serviceDate: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textSecondary,
  },

  cost: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primaryDark,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },

  detailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});

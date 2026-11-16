
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
import { useFocusEffect, useRouter } from 'expo-router';

import {
  getVehicles,
  Vehicle,
} from '../services/vehicle.service';

import { Colors } from '@/theme/colors';

export default function VehiclesScreen() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadVehicles = async () => {
    try {
      const data = await getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadVehicles();
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading your vehicles...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>My Vehicles</Text>

          <Text style={styles.subtitle}>
            Manage your vehicles and maintenance
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          onPress={() => router.push('/add-vehicle')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {vehicles.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>🚗</Text>
          </View>

          <Text style={styles.emptyTitle}>
            No vehicles yet
          </Text>

          <Text style={styles.emptyText}>
            Add your first vehicle to start tracking
            maintenance, service history and reminders.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() => router.push('/add-vehicle')}
          >
            <Text style={styles.primaryButtonText}>
              Add Your Vehicle
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={vehicles}
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
                router.push(`/vehicle/${item.id}`)
              }
            >
              <View style={styles.cardTop}>
                <View style={styles.vehicleIcon}>
                  <Text style={styles.vehicleIconText}>
                    🚗
                  </Text>
                </View>

                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>
                    {item.brand} {item.model}
                  </Text>

                  <Text style={styles.vehicleType}>
                    {item.vehicleType}
                  </Text>
                </View>
              </View>

              {item.registrationNo && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>
                    Registration
                  </Text>

                  <Text style={styles.infoValue}>
                    {item.registrationNo}
                  </Text>
                </View>
              )}

              {item.currentOdometer !== null &&
                item.currentOdometer !== undefined && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>
                      Odometer
                    </Text>

                    <Text style={styles.infoValue}>
                      {item.currentOdometer.toLocaleString()} km
                    </Text>
                  </View>
                )}

              <View style={styles.viewDetails}>
                <Text style={styles.viewDetailsText}>
                  View vehicle details →
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
    fontSize: 14,
    color: Colors.textSecondary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
  },

  addButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 80,
  },

  emptyIcon: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginBottom: 20,
  },

  emptyIconText: {
    fontSize: 38,
  },

  emptyTitle: {
    fontSize: 23,
    fontWeight: '700',
    color: Colors.text,
  },

  emptyText: {
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 21,
    fontSize: 14,
    color: Colors.textSecondary,
  },

  primaryButton: {
    marginTop: 26,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },

  primaryButtonText: {
    color: Colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },

  list: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  vehicleIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginRight: 14,
  },

  vehicleIconText: {
    fontSize: 25,
  },

  vehicleInfo: {
    flex: 1,
  },

  vehicleName: {
    fontSize: 19,
    fontWeight: '700',
    color: Colors.text,
  },

  vehicleType: {
    marginTop: 5,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },

  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },

  viewDetails: {
    marginTop: 16,
    alignItems: 'flex-end',
  },

  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});

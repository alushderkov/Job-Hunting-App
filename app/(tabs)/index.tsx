import { EmptyState } from "@/components/EmptyState";
import { JobCard } from "@/components/JobCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SearchHeader } from "@/components/SearchHeader";
import { Colors } from "@/constants/theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useJobsViewModel } from "@/viewmodels/JobsViewModel";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { t } = useLocalization();
  const colors = Colors[colorScheme || "light"];
  const { isConnected } = useNetworkStatus();

  const vm = useJobsViewModel();
  const [isFilterModalVisible, setFilterModalVisible] = React.useState(false);

  useFocusEffect(
    useCallback(() => {
      vm.handleRefresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vm.activeTab])
  );

  const isDark = colorScheme === "dark";

  const renderTabBar = () => (
    <View
      style={[
        styles.tabBar,
        { borderBottomColor: isDark ? "#2A2A2A" : "#E5E5E5" },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          vm.activeTab === "local" && {
            borderBottomColor: colors.tint,
            borderBottomWidth: 2,
          },
        ]}
        onPress={() => vm.setActiveTab("local")}
        activeOpacity={0.7}
      >
        <Ionicons
          name="briefcase-outline"
          size={16}
          color={vm.activeTab === "local" ? colors.tint : colors.icon}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabText,
            { color: vm.activeTab === "local" ? colors.tint : colors.icon },
          ]}
        >
          {t("home.tabLocal")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          vm.activeTab === "remote" && {
            borderBottomColor: colors.tint,
            borderBottomWidth: 2,
          },
        ]}
        onPress={() => vm.setActiveTab("remote")}
        activeOpacity={0.7}
      >
        <Ionicons
          name="globe-outline"
          size={16}
          color={vm.activeTab === "remote" ? colors.tint : colors.icon}
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabText,
            { color: vm.activeTab === "remote" ? colors.tint : colors.icon },
          ]}
        >
          {t("home.tabRemote")}
        </Text>
        {!isConnected && <View style={styles.offlineDot} />}
      </TouchableOpacity>
    </View>
  );

  const headerComponent = (
    <>
      <SearchHeader
        activeTab={vm.activeTab}
        searchQuery={vm.searchQuery}
        setSearchQuery={vm.setSearchQuery}
        isDark={isDark}
        colors={colors}
        remoteFromCache={vm.remoteFromCache}
        localFromCache={vm.localFromCache}
        onFilterPress={() => setFilterModalVisible(true)}
      />
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {vm.activeTab === "local"
            ? `${t("home.allJobs")} (${vm.filteredLocalJobs.length})`
            : `${t("home.onlineJobs")} (${vm.filteredRemoteJobs ? vm.filteredRemoteJobs.length : vm.remoteJobs.length})`}
        </Text>
      </View>
    </>
  );

  const currentJobs =
    vm.activeTab === "local"
      ? vm.filteredLocalJobs
      : vm.filteredRemoteJobs || vm.remoteJobs;
  const currentLoading =
    vm.activeTab === "local" ? vm.isLoadingLocal : vm.isLoadingRemote;

  if (vm.activeTab === "local" && vm.isLoadingLocal) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pinned tab switcher */}
      <View
        style={[
          styles.tabBarWrapper,
          {
            backgroundColor: colors.background,
            paddingTop: Platform.OS === "ios" ? 56 : 16,
          },
        ]}
      >
        {renderTabBar()}
      </View>

      {vm.activeTab === "remote" && currentLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.icon }]}>
            {t("home.loading")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JobCard
              key={item.id}
              job={item}
              onPress={() => {
                if (vm.activeTab === "local") {
                  router.push(`/job/${item.id}`);
                } else if (item.applyUrl) {
                  router.push(`/job/${item.id}`);
                }
              }}
              onSaveToggle={() => vm.handleSaveToggle(item)}
              showSaveButton={true}
            />
          )}
          ListHeaderComponent={headerComponent}
          ListEmptyComponent={
            <EmptyState
              icon={
                vm.activeTab === "local" ? "briefcase-outline" : "globe-outline"
              }
              title={
                vm.activeTab === "local"
                  ? t("home.noJobs")
                  : t("home.noRemoteJobs")
              }
              message={
                vm.activeTab === "local"
                  ? vm.searchQuery
                    ? `${t("home.noSearchResult")} "${vm.searchQuery}"`
                    : t("home.noLocalJobs")
                  : !isConnected
                    ? t("home.noConnection")
                    : t("home.loading")
              }
            />
          }
          contentContainerStyle={
            currentJobs.length === 0 ? styles.emptyList : undefined
          }
          refreshControl={
            <RefreshControl
              refreshing={vm.isRefreshing}
              onRefresh={vm.handleRefresh}
              tintColor={colors.tint}
            />
          }
        />
      )}

      {/* FAB — only on local tab */}
      {vm.activeTab === "local" && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.tint }]}
          onPress={() => router.push("/add-job")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.background },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("home.filters") || "Filters"}
              </Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
              {t("filter.sortBy")}
            </Text>
            <View style={styles.filterRow}>
              {["newest", "oldest"].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.filterChip,
                    { borderColor: isDark ? "#3A3A3A" : "#E0E0E0" },
                    vm.sortOption === opt && {
                      backgroundColor: colors.tint,
                      borderColor: colors.tint,
                    },
                  ]}
                  onPress={() => vm.setSortOption(opt as any)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      { color: vm.sortOption === opt ? "#fff" : colors.text },
                    ]}
                  >
                    {opt === "newest" ? t("filter.newest") : t("filter.oldest")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterSectionTitle, { color: colors.text }]}>
              {t("filter.jobType")}
            </Text>
            <View style={styles.filterRow}>
              {["all", "full-time", "part-time", "contract", "freelance"].map(
                (opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.filterChip,
                      { borderColor: isDark ? "#3A3A3A" : "#E0E0E0" },
                      vm.filterOption === opt && {
                        backgroundColor: colors.tint,
                        borderColor: colors.tint,
                      },
                    ]}
                    onPress={() => vm.setFilterOption(opt as any)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        {
                          color: vm.filterOption === opt ? "#fff" : colors.text,
                        },
                      ]}
                    >
                      {t(`filter.${opt}`)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBarWrapper: {
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingBottom: 10,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  offlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginLeft: 6,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  header: {
    padding: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  cacheNotice: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  cacheNoticeText: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "500",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  emptyList: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

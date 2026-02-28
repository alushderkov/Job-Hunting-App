import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import jobService from "@/services/jobService";
import remoteJobApiService from "@/services/remoteJobApiService";
import { Job } from "@/types/job";
import { useCallback, useEffect, useRef, useState } from "react";

export type JobsTab = "local" | "remote";

interface JobsViewModel {
  // State
  localJobs: Job[];
  remoteJobs: Job[];
  filteredLocalJobs: Job[];
  searchQuery: string;
  isLoadingLocal: boolean;
  isLoadingRemote: boolean;
  isRefreshing: boolean;
  activeTab: JobsTab;
  remoteFromCache: boolean;

  // Actions
  setSearchQuery: (q: string) => void;
  setActiveTab: (tab: JobsTab) => void;
  handleSaveToggle: (job: Job) => Promise<void>;
  handleRefresh: () => Promise<void>;
  loadRemoteJobs: () => Promise<void>;
}

export function useJobsViewModel(): JobsViewModel {
  const { isConnected } = useNetworkStatus();

  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [remoteJobs, setRemoteJobs] = useState<Job[]>([]);
  const [filteredLocalJobs, setFilteredLocalJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<JobsTab>("local");
  const [remoteFromCache, setRemoteFromCache] = useState(false);

  const remoteLoaded = useRef(false);

  const loadLocalJobs = useCallback(async () => {
    try {
      setIsLoadingLocal(true);
      const jobs = await jobService.getAllJobs();
      setLocalJobs(jobs);
      setFilteredLocalJobs(jobs);
    } catch (err) {
      console.error("loadLocalJobs:", err);
    } finally {
      setIsLoadingLocal(false);
    }
  }, []);

  const loadRemoteJobs = useCallback(async () => {
    try {
      setIsLoadingRemote(true);
      const { jobs, fromCache } = await remoteJobApiService.fetchRemoteJobs(
        "software-dev",
        20
      );
      setRemoteJobs(jobs);
      setRemoteFromCache(fromCache);
    } catch (err) {
      console.error("loadRemoteJobs:", err);
    } finally {
      setIsLoadingRemote(false);
    }
  }, []);

  useEffect(() => {
    loadLocalJobs();
  }, [loadLocalJobs]);

  useEffect(() => {
    if (activeTab === "remote" && !remoteLoaded.current) {
      remoteLoaded.current = true;
      loadRemoteJobs();
    }
  }, [activeTab, loadRemoteJobs]);

  useEffect(() => {
    if (isConnected && activeTab === "remote") {
      loadRemoteJobs();
    }
  }, [isConnected]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLocalJobs(localJobs);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFilteredLocalJobs(
      localJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
      )
    );
  }, [localJobs, searchQuery]);

  const handleSaveToggle = useCallback(
    async (job: Job) => {
      try {
        if (job.isSaved) {
          await jobService.unsaveJob(job.id);
        } else {
          await jobService.saveJob(job.id);
        }
        await loadLocalJobs();
      } catch (err) {
        console.error("handleSaveToggle:", err);
      }
    },
    [loadLocalJobs]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (activeTab === "local") {
      await loadLocalJobs();
    } else {
      remoteLoaded.current = false;
      await loadRemoteJobs();
    }
    setIsRefreshing(false);
  }, [activeTab, loadLocalJobs, loadRemoteJobs]);

  return {
    localJobs,
    remoteJobs,
    filteredLocalJobs,
    searchQuery,
    isLoadingLocal,
    isLoadingRemote,
    isRefreshing,
    activeTab,
    remoteFromCache,
    setSearchQuery,
    setActiveTab,
    handleSaveToggle,
    handleRefresh,
    loadRemoteJobs,
  };
}

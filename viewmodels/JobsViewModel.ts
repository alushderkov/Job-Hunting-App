import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useRealtimeJobs } from "@/hooks/useRealtimeJobs";
import jobService from "@/services/jobService";
import remoteJobApiService from "@/services/remoteJobApiService";
import { Job } from "@/types/job";
import Fuse from "fuse.js";
import { useCallback, useEffect, useRef, useState } from "react";

export type JobsTab = "local" | "remote";

interface JobsViewModel {
  // State
  localJobs: Job[];
  remoteJobs: Job[];
  filteredLocalJobs: Job[];
  filteredRemoteJobs: Job[];
  searchQuery: string;
  isLoadingLocal: boolean;
  isLoadingRemote: boolean;
  isRefreshing: boolean;
  activeTab: JobsTab;
  remoteFromCache: boolean;
  localFromCache: boolean;

  // Sort & Filter State
  sortOption: "newest" | "oldest";
  filterOption: "all" | "full-time" | "part-time" | "contract" | "freelance";

  // Actions
  setSearchQuery: (q: string) => void;
  setActiveTab: (tab: JobsTab) => void;
  setSortOption: (opt: "newest" | "oldest") => void;
  setFilterOption: (
    opt: "all" | "full-time" | "part-time" | "contract" | "freelance"
  ) => void;
  handleSaveToggle: (job: Job) => Promise<void>;
  handleRefresh: () => Promise<void>;
  loadRemoteJobs: () => Promise<void>;
}

export function useJobsViewModel(): JobsViewModel {
  const { isConnected } = useNetworkStatus();

  const [localJobs, setLocalJobs] = useState<Job[]>([]);
  const [remoteJobs, setRemoteJobs] = useState<Job[]>([]);
  const [filteredLocalJobs, setFilteredLocalJobs] = useState<Job[]>([]);
  const [filteredRemoteJobs, setFilteredRemoteJobs] = useState<Job[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<JobsTab>("local");
  const [remoteFromCache, setRemoteFromCache] = useState(false);
  const [localFromCache, setLocalFromCache] = useState(false);
  const [sortOption, setSortOption] = useState<"newest" | "oldest">("newest");
  const [filterOption, setFilterOption] = useState<
    "all" | "full-time" | "part-time" | "contract" | "freelance"
  >("all");

  const remoteLoaded = useRef(false);

  const loadLocalJobs = useCallback(async () => {
    try {
      setIsLoadingLocal(true);
      const { jobs, fromCache } = await jobService.getAllJobs();
      setLocalJobs(jobs);
      setLocalFromCache(fromCache);
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

      const savedIds = await jobService.getSavedJobIds();
      const updatedRemoteJobs = jobs.map((job) => ({
        ...job,
        isSaved: savedIds.includes(job.id),
      }));

      setRemoteJobs(updatedRemoteJobs);
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

  // Real-time: auto-refresh local jobs when DB changes
  useRealtimeJobs(() => {
    loadLocalJobs();
  });

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
  }, [isConnected, activeTab, loadRemoteJobs]);

  useEffect(() => {
    const filterAndSort = (jobs: Job[]) => {
      let result = [...jobs];

      if (filterOption !== "all") {
        const filterStr = filterOption.replace("-", " ");
        result = result.filter(
          (j) =>
            (j.jobType && j.jobType.toLowerCase().includes(filterOption)) ||
            (j.jobType && j.jobType.toLowerCase().includes(filterStr)) ||
            j.description.toLowerCase().includes(filterOption) ||
            j.description.toLowerCase().includes(filterStr) ||
            j.title.toLowerCase().includes(filterOption) ||
            j.title.toLowerCase().includes(filterStr)
        );
      }

      if (searchQuery.trim()) {
        const fuse = new Fuse(result, {
          keys: ["title", "company", "location", "description"],
          threshold: 0.4,
        });
        result = fuse.search(searchQuery).map((res) => res.item);
      }

      result.sort((a, b) => {
        const dateA = new Date(a.postedDate).getTime();
        const dateB = new Date(b.postedDate).getTime();
        return sortOption === "newest" ? dateB - dateA : dateA - dateB;
      });

      return result;
    };

    setFilteredLocalJobs(filterAndSort(localJobs));
    setFilteredRemoteJobs(filterAndSort(remoteJobs));
  }, [localJobs, remoteJobs, searchQuery, sortOption, filterOption]);

  const handleSaveToggle = useCallback(
    async (job: Job) => {
      try {
        if (job.isSaved) {
          await jobService.unsaveJob(job.id);
        } else {
          await jobService.saveJob(job.id, job);
        }
        await loadLocalJobs();

        // Update the remote jobs state directly to avoid a full re-fetch
        setRemoteJobs((prev) =>
          prev.map((j) =>
            j.id === job.id ? { ...j, isSaved: !job.isSaved } : j
          )
        );
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
      await loadRemoteJobs();
    }
    setIsRefreshing(false);
  }, [activeTab, loadLocalJobs, loadRemoteJobs]);

  return {
    localJobs,
    remoteJobs,
    filteredLocalJobs,
    filteredRemoteJobs,
    searchQuery,
    isLoadingLocal,
    isLoadingRemote,
    isRefreshing,
    activeTab,
    remoteFromCache,
    localFromCache,
    sortOption,
    filterOption,
    setSearchQuery,
    setActiveTab,
    setSortOption,
    setFilterOption,
    handleSaveToggle,
    handleRefresh,
    loadRemoteJobs,
  };
}

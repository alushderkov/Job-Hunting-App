import jobService from "@/services/jobService";
import { Job } from "@/types/job";
import { useCallback, useEffect, useState } from "react";

interface SavedJobsViewModel {
  savedJobs: Job[];
  isLoading: boolean;
  isRefreshing: boolean;
  handleUnsave: (job: Job) => Promise<void>;
  handleRefresh: () => Promise<void>;
  reload: () => Promise<void>;
}

export function useSavedJobsViewModel(): SavedJobsViewModel {
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const reload = useCallback(async () => {
    try {
      setIsLoading(true);
      const jobs = await jobService.getSavedJobs();
      setSavedJobs(jobs);
    } catch (err) {
      console.error("useSavedJobsViewModel reload:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleUnsave = useCallback(
    async (job: Job) => {
      try {
        await jobService.unsaveJob(job.id);
        await reload();
      } catch (err) {
        console.error("useSavedJobsViewModel handleUnsave:", err);
      }
    },
    [reload]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await reload();
    setIsRefreshing(false);
  }, [reload]);

  return {
    savedJobs,
    isLoading,
    isRefreshing,
    handleUnsave,
    handleRefresh,
    reload,
  };
}

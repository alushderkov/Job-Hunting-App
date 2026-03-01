import { CreateJobInput, Job, UpdateJobInput } from "@/types/job";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "./supabase";

const SAVED_JOBS_STORAGE_KEY = "@saved_jobs";
const LOCAL_JOBS_CACHE_KEY = "@local_jobs_cache";
const SAVED_JOBS_FULL_CACHE_KEY = "@saved_jobs_full_cache";

class JobService {
  // Get all jobs with caching
  async getAllJobs(): Promise<{ jobs: Job[]; fromCache: boolean }> {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("isLocal", true)
        .order("createdAt", { ascending: false });

      if (error) throw error;

      const jobs: Job[] = data || [];
      const savedJobIds = await this.getSavedJobIds();

      const mappedJobs = jobs.map((job) => ({
        ...job,
        isSaved: savedJobIds.includes(job.id),
      }));

      // Cache the result
      await AsyncStorage.setItem(
        LOCAL_JOBS_CACHE_KEY,
        JSON.stringify(mappedJobs)
      );

      return { jobs: mappedJobs, fromCache: false };
    } catch (error) {
      console.warn(
        "Offline or Error getting jobs from Supabase, trying cache:",
        error
      );
      try {
        const cached = await AsyncStorage.getItem(LOCAL_JOBS_CACHE_KEY);
        if (cached) {
          return { jobs: JSON.parse(cached), fromCache: true };
        }
      } catch (cacheErr) {
        console.error("Cache read error:", cacheErr);
      }
      return { jobs: [], fromCache: false };
    }
  }

  // Get job by ID
  async getJobById(id: string): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return null;

      const savedJobIds = await this.getSavedJobIds();
      return {
        ...data,
        isSaved: savedJobIds.includes(data.id),
      };
    } catch (error) {
      console.error("Error getting job by ID from Supabase:", error);
      return null;
    }
  }

  // Create new job
  async createJob(input: CreateJobInput): Promise<Job> {
    try {
      const newId = uuidv4();
      const { data, error } = await supabase
        .from("jobs")
        .insert([
          {
            id: newId,
            title: input.title,
            company: input.company,
            location: input.location,
            salary: input.salary,
            description: input.description,
            requirements: input.requirements,
            postedDate: input.postedDate,
            imageUrl: input.imageUrl,
            jobType: input.jobType,
            isLocal: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        isSaved: false,
      };
    } catch (error) {
      console.error("Error creating job in Supabase:", error);
      throw error;
    }
  }

  // Update job
  async updateJob(id: string, input: UpdateJobInput): Promise<Job | null> {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .update({
          title: input.title,
          company: input.company,
          location: input.location,
          salary: input.salary,
          description: input.description,
          requirements: input.requirements,
          imageUrl: input.imageUrl,
          jobType: input.jobType,
          isLocal: true,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      const savedJobIds = await this.getSavedJobIds();
      return {
        ...data,
        isSaved: savedJobIds.includes(data.id),
      };
    } catch (error) {
      console.error("Error updating job in Supabase:", error);
      throw error;
    }
  }

  // Delete job
  async deleteJob(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id);

      if (error) throw error;

      // Also remove from saved jobs locally if it was saved
      await this.unsaveJob(id);

      return true;
    } catch (error) {
      console.error("Error deleting job from Supabase:", error);
      throw error;
    }
  }

  // Save job to favorites (Local + Supabase for remote jobs)
  async saveJob(id: string, job?: Job): Promise<boolean> {
    try {
      if (
        job &&
        (job.source === "remote" ||
          job.isLocal === false ||
          job.id.startsWith("remotive_"))
      ) {
        const { error: upsertError } = await supabase.from("jobs").upsert({
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          description: job.description,
          requirements: job.requirements,
          postedDate: job.postedDate,
          imageUrl: job.imageUrl,
          jobType: job.jobType,
          isLocal: false,
          updatedAt: new Date().toISOString(),
        });

        if (upsertError) throw upsertError;
      }

      const savedJobIds = await this.getSavedJobIds();
      if (!savedJobIds.includes(id)) {
        savedJobIds.push(id);
        await AsyncStorage.setItem(
          SAVED_JOBS_STORAGE_KEY,
          JSON.stringify(savedJobIds)
        );
      }
      return true;
    } catch (error) {
      console.error("Error saving job locally:", error);
      throw error;
    }
  }

  // Unsave job from favorites (Local)
  async unsaveJob(id: string): Promise<boolean> {
    try {
      const savedJobIds = await this.getSavedJobIds();
      const filteredIds = savedJobIds.filter((savedId) => savedId !== id);
      await AsyncStorage.setItem(
        SAVED_JOBS_STORAGE_KEY,
        JSON.stringify(filteredIds)
      );
      return true;
    } catch (error) {
      console.error("Error unsaving job locally:", error);
      throw error;
    }
  }

  // Get saved jobs with caching
  async getSavedJobs(): Promise<{ jobs: Job[]; fromCache: boolean }> {
    try {
      const savedJobIds = await this.getSavedJobIds();
      if (savedJobIds.length === 0) return { jobs: [], fromCache: false };

      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .in("id", savedJobIds);

      if (error) throw error;

      const jobs: Job[] = data || [];
      const mappedJobs = jobs.map((job) => ({
        ...job,
        isSaved: true,
      }));

      // Cache the full data for offline use
      await AsyncStorage.setItem(
        SAVED_JOBS_FULL_CACHE_KEY,
        JSON.stringify(mappedJobs)
      );

      return { jobs: mappedJobs, fromCache: false };
    } catch (err) {
      console.warn("Offline or Error getting saved jobs, trying cache:", err);
      try {
        const cached = await AsyncStorage.getItem(SAVED_JOBS_FULL_CACHE_KEY);
        if (cached) {
          return { jobs: JSON.parse(cached), fromCache: true };
        }
      } catch (cacheErr) {
        console.error("Cache read error:", cacheErr);
      }
      return { jobs: [], fromCache: false };
    }
  }

  // Search jobs (Server-side search)
  async searchJobs(query: string): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("isLocal", true)
        .or(
          `title.ilike.%${query}%,company.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`
        )
        .order("createdAt", { ascending: false });

      if (error) throw error;

      const jobs: Job[] = data || [];
      const savedJobIds = await this.getSavedJobIds();

      return jobs.map((job) => ({
        ...job,
        isSaved: savedJobIds.includes(job.id),
      }));
    } catch (error) {
      console.error("Error searching jobs in Supabase:", error);
      return [];
    }
  }

  // Helper to get saved job IDs from AsyncStorage
  async getSavedJobIds(): Promise<string[]> {
    try {
      const savedJobsJson = await AsyncStorage.getItem(SAVED_JOBS_STORAGE_KEY);
      return savedJobsJson ? JSON.parse(savedJobsJson) : [];
    } catch {
      return [];
    }
  }

  // Clear all data (Note: This only clears local saved IDs for safety)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SAVED_JOBS_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing local data:", error);
    }
  }
}

export default new JobService();

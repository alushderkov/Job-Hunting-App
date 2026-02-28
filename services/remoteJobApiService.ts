import { Job, RemotiveApiResponse, RemotiveJob } from "@/types/job";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://remotive.com/api/remote-jobs";
const CACHE_KEY = "@remotive_cache";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  timestamp: number;
  jobs: Job[];
}

function mapRemotiveJob(rj: RemotiveJob): Job {
  const now = new Date().toISOString();
  const cleanDescription = rj.description
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);

  return {
    id: `remotive_${rj.id}`,
    title: rj.title,
    company: rj.company_name,
    location: rj.candidate_required_location || "Remote",
    salary: rj.salary || "Not specified",
    description: cleanDescription,
    requirements: rj.tags.join(", "),
    postedDate: rj.publication_date,
    isSaved: false,
    createdAt: now,
    updatedAt: now,
    source: "remote",
    applyUrl: rj.url,
  };
}

class RemoteJobApiService {
  /**
   * @param category  Optional category filter (e.g. "software-dev")
   * @param limit     Max number of results (default 20)
   * @returns Array of Job objects, or cached data when offline
   */
  async fetchRemoteJobs(
    category?: string,
    limit: number = 20
  ): Promise<{ jobs: Job[]; fromCache: boolean }> {
    try {
      const url = new URL(API_BASE);
      if (category) url.searchParams.set("category", category);
      url.searchParams.set("limit", String(limit));

      const response = await fetch(url.toString(), {
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: RemotiveApiResponse = await response.json();
      const jobs = data.jobs.map(mapRemotiveJob);

      const entry: CacheEntry = { timestamp: Date.now(), jobs };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));

      return { jobs, fromCache: false };
    } catch {
      const cached = await this.getCache();
      if (cached) {
        return { jobs: cached, fromCache: true };
      }
      return { jobs: [], fromCache: false };
    }
  }

  async getCache(): Promise<Job[] | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;

      const entry: CacheEntry = JSON.parse(raw);
      const age = Date.now() - entry.timestamp;

      if (age > CACHE_TTL_MS) {
        return null; // expired
      }

      return entry.jobs;
    } catch {
      return null;
    }
  }

  async getCacheForOffline(): Promise<Job[] | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const entry: CacheEntry = JSON.parse(raw);
      return entry.jobs;
    } catch {
      return null;
    }
  }

  async hasCache(): Promise<boolean> {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw !== null;
  }

  async clearCache(): Promise<void> {
    await AsyncStorage.removeItem(CACHE_KEY);
  }
}

export default new RemoteJobApiService();

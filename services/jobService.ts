import { CreateJobInput, Job, UpdateJobInput } from "@/types/job";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JOBS_STORAGE_KEY = "@jobs_data";
const SAVED_JOBS_STORAGE_KEY = "@saved_jobs";

class JobService {
  // Generate unique ID
  private generateId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get all jobs
  async getAllJobs(): Promise<Job[]> {
    try {
      const jobsJson = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
      if (jobsJson) {
        return JSON.parse(jobsJson);
      }

      // Return sample data if no jobs exist
      const sampleJobs = this.getSampleJobs();
      await this.saveJobs(sampleJobs);
      return sampleJobs;
    } catch (error) {
      console.error("Error getting jobs:", error);
      return [];
    }
  }

  // Get job by ID
  async getJobById(id: string): Promise<Job | null> {
    try {
      const jobs = await this.getAllJobs();
      return jobs.find((job) => job.id === id) || null;
    } catch (error) {
      console.error("Error getting job by ID:", error);
      return null;
    }
  }

  // Create new job
  async createJob(input: CreateJobInput): Promise<Job> {
    try {
      const jobs = await this.getAllJobs();
      const now = new Date().toISOString();

      const newJob: Job = {
        ...input,
        id: this.generateId(),
        isSaved: false,
        createdAt: now,
        updatedAt: now,
      };

      jobs.unshift(newJob); // Add to beginning
      await this.saveJobs(jobs);

      return newJob;
    } catch (error) {
      console.error("Error creating job:", error);
      throw error;
    }
  }

  // Update job
  async updateJob(id: string, input: UpdateJobInput): Promise<Job | null> {
    try {
      const jobs = await this.getAllJobs();
      const jobIndex = jobs.findIndex((job) => job.id === id);

      if (jobIndex === -1) {
        return null;
      }

      const updatedJob: Job = {
        ...jobs[jobIndex],
        ...input,
        updatedAt: new Date().toISOString(),
      };

      jobs[jobIndex] = updatedJob;
      await this.saveJobs(jobs);

      return updatedJob;
    } catch (error) {
      console.error("Error updating job:", error);
      throw error;
    }
  }

  // Delete job
  async deleteJob(id: string): Promise<boolean> {
    try {
      const jobs = await this.getAllJobs();
      const filteredJobs = jobs.filter((job) => job.id !== id);

      if (filteredJobs.length === jobs.length) {
        return false; // Job not found
      }

      await this.saveJobs(filteredJobs);

      // Also remove from saved jobs if it was saved
      await this.unsaveJob(id);

      return true;
    } catch (error) {
      console.error("Error deleting job:", error);
      throw error;
    }
  }

  // Save job to favorites
  async saveJob(id: string): Promise<boolean> {
    try {
      const jobs = await this.getAllJobs();
      const jobIndex = jobs.findIndex((job) => job.id === id);

      if (jobIndex === -1) {
        return false;
      }

      jobs[jobIndex].isSaved = true;
      await this.saveJobs(jobs);

      // Add to saved jobs list
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
      console.error("Error saving job:", error);
      throw error;
    }
  }

  // Unsave job from favorites
  async unsaveJob(id: string): Promise<boolean> {
    try {
      const jobs = await this.getAllJobs();
      const jobIndex = jobs.findIndex((job) => job.id === id);

      if (jobIndex !== -1) {
        jobs[jobIndex].isSaved = false;
        await this.saveJobs(jobs);
      }

      // Remove from saved jobs list
      const savedJobIds = await this.getSavedJobIds();
      const filteredIds = savedJobIds.filter((savedId) => savedId !== id);
      await AsyncStorage.setItem(
        SAVED_JOBS_STORAGE_KEY,
        JSON.stringify(filteredIds)
      );

      return true;
    } catch (error) {
      console.error("Error unsaving job:", error);
      throw error;
    }
  }

  // Get saved jobs
  async getSavedJobs(): Promise<Job[]> {
    try {
      const allJobs = await this.getAllJobs();
      return allJobs.filter((job) => job.isSaved);
    } catch (error) {
      console.error("Error getting saved jobs:", error);
      return [];
    }
  }

  // Search jobs
  async searchJobs(query: string): Promise<Job[]> {
    try {
      const jobs = await this.getAllJobs();
      const lowerQuery = query.toLowerCase();

      return jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(lowerQuery) ||
          job.company.toLowerCase().includes(lowerQuery) ||
          job.location.toLowerCase().includes(lowerQuery) ||
          job.description.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error("Error searching jobs:", error);
      return [];
    }
  }

  // Private helper methods
  private async saveJobs(jobs: Job[]): Promise<void> {
    await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  }

  private async getSavedJobIds(): Promise<string[]> {
    try {
      const savedJobsJson = await AsyncStorage.getItem(SAVED_JOBS_STORAGE_KEY);
      return savedJobsJson ? JSON.parse(savedJobsJson) : [];
    } catch (error) {
      return [];
    }
  }

  // Sample data for initial load
  private getSampleJobs(): Job[] {
    const now = new Date().toISOString();

    return [
      {
        id: this.generateId(),
        title: "Senior React Native Developer",
        company: "TechCorp International",
        location: "Remote, Worldwide",
        salary: "$90,000 - $130,000",
        description:
          "We are looking for an experienced React Native developer to join our mobile team. You will be responsible for building high-quality mobile applications for iOS and Android platforms.",
        requirements:
          "5+ years of React Native experience\nStrong knowledge of JavaScript/TypeScript\nExperience with Redux or MobX\nFamiliarity with native build tools\nExcellent problem-solving skills",
        postedDate: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        isSaved: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: this.generateId(),
        title: "Full Stack JavaScript Developer",
        company: "StartupHub",
        location: "Remote, Europe",
        salary: "€60,000 - €85,000",
        description:
          "Join our dynamic startup as a Full Stack Developer. Work on exciting projects using modern JavaScript technologies including React, Node.js, and MongoDB.",
        requirements:
          "3+ years of full-stack development\nProficiency in React and Node.js\nExperience with MongoDB or PostgreSQL\nKnowledge of REST APIs and GraphQL\nGood communication skills",
        postedDate: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        isSaved: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: this.generateId(),
        title: "Mobile App Developer (iOS/Android)",
        company: "Digital Solutions Ltd",
        location: "Remote, USA",
        salary: "$80,000 - $110,000",
        description:
          "We need a talented mobile developer to create innovative applications for our clients. Experience with both native and cross-platform development is a plus.",
        requirements:
          "Experience with React Native or Flutter\nKnowledge of native iOS/Android development\nUnderstanding of mobile UI/UX principles\nExperience with app deployment\nStrong portfolio of published apps",
        postedDate: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        isSaved: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: this.generateId(),
        title: "Frontend Developer (React)",
        company: "WebWorks Agency",
        location: "Remote, Canada",
        salary: "CAD 70,000 - 95,000",
        description:
          "Looking for a passionate Frontend Developer to build beautiful and responsive web applications using React and modern CSS frameworks.",
        requirements:
          "2+ years of React development\nStrong CSS and HTML skills\nExperience with responsive design\nKnowledge of state management\nAttention to detail",
        postedDate: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        isSaved: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: this.generateId(),
        title: "React Native Engineer",
        company: "MobileFirst Inc",
        location: "Remote, Asia",
        salary: "$75,000 - $100,000",
        description:
          "Be part of our growing mobile team developing cutting-edge applications for millions of users worldwide. We value innovation and creativity.",
        requirements:
          "4+ years mobile development experience\nExpert in React Native\nExperience with CI/CD pipelines\nKnowledge of mobile security best practices\nTeam player with leadership skills",
        postedDate: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
        isSaved: false,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(JOBS_STORAGE_KEY);
      await AsyncStorage.removeItem(SAVED_JOBS_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  }
}

export default new JobService();

import { supabase } from "@/services/supabase";
import { useEffect } from "react";

export function useRealtimeJobs(onJobsChanged: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel("jobs-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "jobs" },
        (_payload) => {
          console.log("[Realtime] Jobs table changed, refreshing...");
          onJobsChanged();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

"use client";
import { useEffect, useCallback } from "react";
import { getProfile, calculate } from "@/lib/api";
import { useTaxStore } from "@/store/taxStore";

export function useTaxProfile() {
  const { profile, calculation, setProfile, setCalculation } = useTaxStore();

  const refresh = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([getProfile(), calculate()]);
      setProfile(p);
      setCalculation(c);
    } catch {
      // not logged in yet, silently ignore
    }
  }, [setProfile, setCalculation]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, calculation, refresh };
}

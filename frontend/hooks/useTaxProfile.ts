"use client";
import { useEffect, useCallback, useState } from "react";
import { getProfile, calculate } from "@/lib/api";
import { useTaxStore } from "@/store/taxStore";

export function useTaxProfile() {
  const { profile, calculation, setProfile, setCalculation } = useTaxStore();
  const [loading, setLoading] = useState(true);
  const [hasIncome, setHasIncome] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getProfile();
      setProfile(p);
      if (p.gross_income) {
        setHasIncome(true);
        try {
          const c = await calculate();
          setCalculation(c);
        } catch {
          // calculate failed even with income set — ignore
        }
      } else {
        setHasIncome(false);
      }
    } catch {
      // not logged in or network error
    } finally {
      setLoading(false);
    }
  }, [setProfile, setCalculation]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, calculation, refresh, loading, hasIncome };
}

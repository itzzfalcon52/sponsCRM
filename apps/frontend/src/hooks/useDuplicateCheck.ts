import { useState, useEffect } from "react";
import { api } from "../api/axios";
import { useDebounce } from "./useDebounce"; // standard debounce hook

export function useDuplicateCheck(name: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const debouncedName = useDebounce(name, 400);

  useEffect(() => {
    async function checkDuplicates() {
      if (debouncedName.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsChecking(true);
      try {
        // We hit the create endpoint with a "checkOnly" flag 
        // OR a dedicated search endpoint if you prefer
        const res = await api.get(`/companies/search/duplicates?name=${debouncedName}`);
        setSuggestions(res.data.suggestions || []);
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsChecking(false);
      }
    }

    checkDuplicates();
  }, [debouncedName]);

  return { suggestions, isChecking };
}
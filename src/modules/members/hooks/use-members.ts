// ============================================================================
// Members Module - Client-side Hooks
// ============================================================================

"use client";

import { useState, useCallback } from "react";
import type { MemberWithDetails } from "../types";

interface UseMembersState {
  members: MemberWithDetails[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
}

/**
 * Hook for managing members list state on the client.
 * Works with server-fetched initial data for SSR.
 */
export function useMembers(initialMembers?: MemberWithDetails[]) {
  const [state, setState] = useState<UseMembersState>({
    members: initialMembers ?? [],
    loading: false,
    error: null,
    total: initialMembers?.length ?? 0,
    page: 1,
  });

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error, loading: false }));
  }, []);

  const setMembers = useCallback(
    (members: MemberWithDetails[], total: number) => {
      setState((prev) => ({
        ...prev,
        members,
        total,
        loading: false,
        error: null,
      }));
    },
    []
  );

  const removeMember = useCallback((membershipId: string) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== membershipId),
      total: prev.total - 1,
    }));
  }, []);

  const addMember = useCallback((member: MemberWithDetails) => {
    setState((prev) => ({
      ...prev,
      members: [member, ...prev.members],
      total: prev.total + 1,
    }));
  }, []);

  return {
    ...state,
    setLoading,
    setError,
    setMembers,
    removeMember,
    addMember,
  };
}

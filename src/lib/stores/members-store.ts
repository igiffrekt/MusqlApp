"use client"

import { create } from "zustand"

export interface Member {
  id: string
  firstName: string
  lastName: string
  status: "active" | "inactive" | "debt" | "unsettled"
  phone?: string
  email?: string
  guardian?: string
  groups: string[]
  profileImage?: string
  createdAt: string
  beltLevel?: string
}

interface MembersState {
  members: Member[]
  loading: boolean
  error: string | null
  initialized: boolean
  currentOrgId: string | null // Track which org's members we have

  // Actions
  fetchMembers: (orgId?: string) => Promise<void>
  addMember: (member: Omit<Member, "id" | "createdAt">) => Promise<void>
  updateMember: (id: string, updates: Partial<Member>) => Promise<void>
  deleteMember: (id: string) => Promise<void>
  getMembersByGroup: (groupId: string) => Member[]
  reset: () => void
}

export const useMembersStore = create<MembersState>()((set, get) => ({
  members: [],
  loading: false,
  error: null,
  initialized: false,
  currentOrgId: null,

  fetchMembers: async (orgId?: string) => {
    const state = get()

    // If orgId provided and different from current, reset first
    if (orgId && state.currentOrgId && orgId !== state.currentOrgId) {
      set({ members: [], initialized: false, currentOrgId: null })
    }

    set({ loading: true, error: null })
    try {
      const response = await fetch("/api/students")
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          set({ members: [], initialized: true, loading: false, currentOrgId: null })
          return
        }
        throw new Error("Failed to fetch members")
      }
      const data = await response.json()

      // Transform API response to match store format
      const members: Member[] = (data.students || []).map((s: {
        id: string
        firstName: string
        lastName: string
        email?: string
        phone?: string
        status: string
        beltLevel?: string
        createdAt: string
        guardian?: string
        groups?: string[]
      }) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        status: s.status?.toLowerCase() === "active" ? "active" :
                s.status?.toLowerCase() === "inactive" ? "inactive" :
                s.status?.toLowerCase() === "debt" ? "debt" : "unsettled",
        beltLevel: s.beltLevel,
        guardian: s.guardian,
        groups: s.groups || [],
        createdAt: s.createdAt,
      }))

      set({ members, initialized: true, loading: false, currentOrgId: orgId || null })
    } catch (error) {
      console.error("Failed to fetch members:", error)
      set({ error: "Nem sikerült betölteni a tagokat", loading: false, initialized: true })
    }
  },

  reset: () => {
    set({ members: [], initialized: false, currentOrgId: null, loading: false, error: null })
  },

  addMember: async (memberData) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          email: memberData.email,
          phone: memberData.phone,
          beltLevel: memberData.beltLevel,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to add member")
      }

      const data = await response.json()
      const newMember: Member = {
        id: data.student.id,
        firstName: data.student.firstName,
        lastName: data.student.lastName,
        email: data.student.email,
        phone: data.student.phone,
        status: "unsettled",
        beltLevel: data.student.beltLevel,
        groups: [],
        createdAt: data.student.createdAt,
      }

      set((state) => ({
        members: [newMember, ...state.members],
        loading: false,
      }))
    } catch (error) {
      console.error("Failed to add member:", error)
      set({ error: "Nem sikerült hozzáadni a tagot", loading: false })
      throw error
    }
  },

  updateMember: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update member")
      }

      set((state) => ({
        members: state.members.map((m) =>
          m.id === id ? { ...m, ...updates } : m
        ),
        loading: false,
      }))
    } catch (error) {
      console.error("Failed to update member:", error)
      set({ error: "Nem sikerült frissíteni a tagot", loading: false })
      throw error
    }
  },

  deleteMember: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete member")
      }

      set((state) => ({
        members: state.members.filter((m) => m.id !== id),
        loading: false,
      }))
    } catch (error) {
      console.error("Failed to delete member:", error)
      set({ error: "Nem sikerült törölni a tagot", loading: false })
      throw error
    }
  },

  getMembersByGroup: (groupId) => {
    return get().members.filter((m) => m.groups.includes(groupId))
  },
}))

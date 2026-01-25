// Shared mock data for consistent use across components
// In production, this would come from the database via API

export interface Group {
  id: string
  name: string
  memberCount: number
  dailyFee: number
  monthlyFee: number
  color: string
}

export const GROUPS: Group[] = [
  {
    id: "iskolas-csoport",
    name: "Iskolás csoport",
    memberCount: 15,
    dailyFee: 2000,
    monthlyFee: 12000,
    color: "#1ad598",
  },
  {
    id: "felnott-hobbi-csoport",
    name: "Felnőtt hobbi csoport",
    memberCount: 11,
    dailyFee: 2500,
    monthlyFee: 15000,
    color: "#D2F159",
  },
  {
    id: "versenyzok",
    name: "Versenyzők",
    memberCount: 8,
    dailyFee: 3000,
    monthlyFee: 18000,
    color: "#f59e0b",
  },
]

export const getGroupById = (id: string): Group | undefined => {
  return GROUPS.find(g => g.id === id)
}

export const getGroupColor = (id: string): string => {
  return getGroupById(id)?.color || "#333842"
}

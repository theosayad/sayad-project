
export interface Sibling {
  id: string;
  name: string;
  birthYear?: string;
  migrationDestination?: string;
  description: string;
  childrenCount: number;
}

export interface FamilyTreeData {
  name: string;
  children?: FamilyTreeData[];
}

export interface AIResponse {
  history: string;
}

export interface MenuItem {
  id: string;
  name: string;
  url: string | null;
  icon: string | null;
  order: number;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  children: MenuItem[];
} 
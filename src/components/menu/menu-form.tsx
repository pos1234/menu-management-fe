"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { MenuItem } from './types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MenuFormProps {
  parentItem: MenuItem;
  onSave: (newTitle: string, selectedParentId: string | null) => void;
  onCancel: () => void;
  getItemDepth: (item: MenuItem) => number;
  isEditing?: boolean;
  menus: MenuItem[];
}

// Helper function to find parent item recursively
const findParentItem = (items: MenuItem[], parentId: string | null): MenuItem | null => {
  for (const item of items) {
    if (item.id === parentId) return item;
    if (item.children) {
      const found = findParentItem(item.children, parentId);
      if (found) return found;
    }
  }
  return null;
};

export function MenuForm({ parentItem, onSave, onCancel, getItemDepth, isEditing, menus }: MenuFormProps) {
  const [newTitle, setNewTitle] = useState(isEditing ? parentItem.name : '');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(parentItem.parentId);

  useEffect(() => {
    setNewTitle(isEditing ? parentItem.name : '');
    setSelectedParentId(parentItem.parentId);
  }, [parentItem, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newTitle, selectedParentId);
    setNewTitle('');
  };

  // Get parent name
  const getParentName = () => {
    if (!selectedParentId) return 'Root';
    const parent = findParentItem(menus, selectedParentId);
    return parent ? parent.name : 'Root';
  };

  return (
    <div className="p-4 border-l">
      <h3 className="text-lg font-medium mb-4">
        {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Parent Item</Label>
          <div className="text-sm p-2 border rounded-md bg-gray-50">
            {getParentName()}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Depth Level</Label>
          <div className="text-sm">
            {getItemDepth(parentItem)} (Child items will be at level {getItemDepth(parentItem) + 1})
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newTitle">Menu Title</Label>
            <Input
              id="newTitle"
              value={newTitle}
              className="bg-white"
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter menu title"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
              Save
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 
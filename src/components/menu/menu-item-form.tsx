'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createMenuItem } from '@/lib/api/menu';

interface MenuItemFormProps {
  menuId: number;
  parentId?: number;
  onSuccess?: () => void;
}

export function MenuItemForm({ menuId, parentId, onSuccess }: MenuItemFormProps) {
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      try {
        setLoading(true);
        await createMenuItem({
          name: title,
          parentId: parentId?.toString() || null,
          order: 0
        });
        setTitle('');
        setPath('');
        onSuccess?.();
      } catch (error) {
        console.error('Failed to create menu item:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter item title"
        className="max-w-sm"
        disabled={loading}
      />
      <Input
        type="text"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        placeholder="Enter item path (optional)"
        className="max-w-sm"
        disabled={loading}
      />
      <Button type="submit" className="max-w-sm" disabled={loading}>
        {loading ? 'Adding...' : 'Add Item'}
      </Button>
    </form>
  );
} 
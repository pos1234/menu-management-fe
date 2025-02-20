'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRightIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { MenuItemForm } from './menu-item-form';
import { getMenus } from '@/lib/api/menu';

interface MenuItem {
  id: number;
  title: string;
  path?: string;
  order: number;
  parentId?: number;
  menuId: number;
  children?: MenuItem[];
}

interface Menu {
  id: number;
  name: string;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export function MenuTree() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const data = await getMenus();
      setMenus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className="relative">
        <div
          className={`flex items-center py-1 px-2 rounded-md`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {item.children && item.children.length > 0 && (
            <ChevronRightIcon className="h-4 w-4" />
          )}
          <span className="ml-2">{item.title}</span>
        </div>
        {selectedMenu === item.id && (
          <div className="ml-8 mt-2">
            <MenuItemForm 
              menuId={item.menuId} 
              parentId={item.id} 
              onSuccess={loadMenus}
            />
          </div>
        )}
        {item.children && item.children.length > 0 && (
          <div className="ml-4">
            {renderMenuItems(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return <div>Loading menus...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!menus || menus.length === 0) {
    return <div>No menus available</div>;
  }

  return (
    <div className="space-y-4 px-3 text-sm">
      {menus.map((menu: Menu) => (
        <div key={menu.id} className="space-y-2">
          <div className="flex items-center">
            <span className="font-medium">{menu.name}</span>
          </div>
          {menu.items && menu.items.length > 0 && (
            <div className="ml-4">
              {renderMenuItems(menu.items)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 
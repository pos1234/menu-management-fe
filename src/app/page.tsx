"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MenuForm } from "@/components/menu/menu-form";
import { MenuItemComponent } from "@/components/menu/menu-item";
import { MenuItem } from "@/components/menu/types";
import { fetchMenus, createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/api/menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Menu {
  id: number;
  name: string;
  items: MenuItem[];
}

export default function Home() {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRootMenu, setSelectedRootMenu] = useState<string>('');
  const [showRootForm, setShowRootForm] = useState(false);

  useEffect(() => {
    const loadMenus = async () => {
      try {
        setLoading(true);
        const data = await fetchMenus();
        console.log(">> log datas",data)
        setMenus(data);
        // Show root form if no menus exist
        if (data.length === 0) {
          setShowRootForm(true);
        }
      } catch (error) {
        console.error('Failed to load menus:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMenus();
  }, []);

  // Get root menus and set initial selection
  const rootMenus = menus.filter(menu => !menu.parentId);

  useEffect(() => {
    // Set the first menu as selected when menus are loaded
    if (rootMenus.length > 0 && !selectedRootMenu) {
      setSelectedRootMenu(rootMenus[0].id);
    }
  }, [menus, selectedRootMenu]);

  // Helper function to calculate item depth
  const getItemDepth = (item: MenuItem): number => {
    let depth = 0;
    let currentItem = item;
    
    menus.forEach(menu => {
      const findParentDepth = (items: MenuItem[] | undefined, currentDepth: number): number => {
        if (!items) return depth;
        
        for (const menuItem of items) {
          if (menuItem.id === currentItem.parentId) {
            depth = currentDepth;
            currentItem = menuItem;
            return findParentDepth(menu.children, currentDepth - 1);
          }
          if (menuItem.children) {
            findParentDepth(menuItem.children, currentDepth + 1);
          }
        }
        return depth;
      };
      
      findParentDepth(menu.children, 1);
    });

    return depth;
  };

  const handleAddItem = (item: MenuItem) => {
    setSelectedItem({
      ...item,
      name: '',
      id: '',
      parentId: item.id
    });
    setIsEditing(false);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem({
      ...item,
      parentId: item.parentId
    });
    setIsEditing(true);
  };

  const handleDeleteItem = async (item: MenuItem) => {
    try {
      await deleteMenuItem(item.id);
      const updatedMenus = menus.filter(menu => menu.id !== item.id).map(menu => ({
        ...menu,
        children: deleteItemRecursively(menu.children, item.id)
      }));
      setMenus(updatedMenus);

      // If we deleted a root menu
      if (!item.parentId) {
        // If there are no more menus, show the root form
        if (updatedMenus.length === 0) {
          setShowRootForm(true);
        } else {
          // Select the first available root menu
          const firstRoot = updatedMenus.find(menu => !menu.parentId);
          if (firstRoot) {
            setSelectedRootMenu(firstRoot.id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete menu item:', error);
    }
  };

  const handleSaveNewItem = async (newTitle: string, selectedParentId: string | null) => {
    if (!selectedItem) return;

    try {
      if (isEditing) {
        await updateMenuItem(selectedItem.id, { name: newTitle });
        
        // If it's a root menu, update it directly in the menus array
        if (!selectedItem.parentId) {
          const updatedMenus = menus.map(menu => 
            menu.id === selectedItem.id 
              ? { ...menu, name: newTitle }
              : menu
          );
          setMenus(updatedMenus);
        } else {
          // For non-root items, update in the children
          const updatedMenus = menus.map(menu => ({
            ...menu,
            children: updateItemRecursively(menu.children, selectedItem.id, newTitle)
          }));
          setMenus(updatedMenus);
        }
        setIsEditing(false);
      } else {
        const newItem = await createMenuItem({
          name: newTitle,
          parentId: selectedParentId,
          order: 0
        });

        // Update menus immediately with the new item
        const updatedMenus = menus.map(menu => {
          if (menu.id === selectedParentId) {
            return {
              ...menu,
              children: [...(menu.children || []), newItem]
            };
          }
          return {
            ...menu,
            children: updateMenuItems(menu.children, selectedParentId!, newItem)
          };
        });
        setMenus(updatedMenus);
      }
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  // Helper function to get all item IDs (including children)
  const getAllItemIds = (item: MenuItem): string[] => {
    const ids = [item.id];
    if (item.children) {
      ids.push(...item.children.flatMap(getAllItemIds));
    }
    return ids;
  };

  // Helper function to update menu items recursively
  const updateMenuItems = (items: MenuItem[], parentId: string, newItem: MenuItem): MenuItem[] => {
    return items.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newItem]
        };
      }
      if (item.children) {
        return {
          ...item,
          children: updateMenuItems(item.children, parentId, newItem)
        };
      }
      return item;
    });
  };

  const deleteItemRecursively = (items: MenuItem[], idToDelete: string): MenuItem[] => {
    return items.filter(item => {
      if (item.id === idToDelete) {
        return false;
      }
      if (item.children) {
        item.children = deleteItemRecursively(item.children, idToDelete);
      }
      return true;
    });
  };

  const updateItemRecursively = (items: MenuItem[], idToUpdate: string, newTitle: string): MenuItem[] => {
    return items.map(item => {
      if (item.id === idToUpdate) {
        return {
          ...item,
          name: newTitle,
          updatedAt: new Date().toISOString()
        };
      }
      if (item.children) {
        return {
          ...item,
          children: updateItemRecursively(item.children, idToUpdate, newTitle)
        };
      }
      return item;
    });
  };

  // Handle creating root menu item
  const handleCreateRoot = async (newTitle: string) => {
    try {
      const newItem = await createMenuItem({
        name: newTitle,
        parentId: null,
        order: 0
      });
      const updatedMenus = [...menus, newItem];
      setMenus(updatedMenus);
      setShowRootForm(false);
      setSelectedRootMenu(newItem.id); // Select the newly created root menu
    } catch (error) {
      console.error('Failed to create root menu:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 text-black">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Menus</h1>
                <div className="text-sm text-gray-500">systemmanagement</div>
              </div>
            </div>

            {showRootForm ? (
              <div className="w-full max-w-md mx-auto">
                <MenuForm
                  parentItem={{ id: '', name: '', parentId: null } as MenuItem}
                  onSave={handleCreateRoot}
                  onCancel={() => setShowRootForm(false)}
                  getItemDepth={() => 0}
                  isEditing={false}
                  menus={menus}
                />
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 ">
                  {!showRootForm && (
                    rootMenus.length > 0 ? (
                      <Select value={selectedRootMenu} onValueChange={setSelectedRootMenu}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Select menu to view" />
                        </SelectTrigger>
                        <SelectContent>
                          {rootMenus.map((menu) => (
                            <SelectItem key={menu.id} value={menu.id}>
                              {menu.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Button onClick={() => setShowRootForm(true)} className="w-full sm:w-auto">
                        Create Root Menu
                      </Button>
                    )
                  )}

                  {/* Controls */}
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      className="text-sm flex-1 sm:flex-none"
                      onClick={() => setExpanded(true)}
                    >
                      Expand All
                    </Button>
                    <Button
                      variant="outline"
                      className="text-sm flex-1 sm:flex-none"
                      onClick={() => setExpanded(false)}
                    >
                      Collapse All
                    </Button>
                  </div>
                </div>

                {/* Menu Tree */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <ScrollArea className="h-[calc(100vh-350px)] lg:h-[calc(100vh-250px)]">
                    <div className="space-y-0.5 relative">
                      {menus
                        .filter(menu => menu.id === selectedRootMenu)
                        .map((menu, index, filtered) => (
                          <div key={menu.id} className="space-y-1">
                            <MenuItemComponent
                              item={menu}
                              level={0}
                              isLastChild={index === filtered.length - 1}
                              expanded={expanded}
                              onAdd={handleAddItem}
                              onEdit={handleEditItem}
                              onDelete={handleDeleteItem}
                            />
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </div>

          {/* Form for editing/adding child items */}
          {selectedItem && !showRootForm && (
            <div className="w-full lg:w-80">
              <MenuForm
                parentItem={selectedItem}
                onSave={handleSaveNewItem}
                onCancel={() => setSelectedItem(null)}
                getItemDepth={getItemDepth}
                isEditing={isEditing}
                menus={menus}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

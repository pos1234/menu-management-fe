"use client";

import { Button } from "@/components/ui/button";
import { ChevronDownIcon, PlusIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { MenuItem } from "./types";

interface MenuItemProps {
  item: MenuItem;
  level: number;
  isLastChild: boolean;
  expanded: boolean;
  onAdd: (item: MenuItem) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
}

export function MenuItemComponent({
  item,
  level,
  isLastChild,
  expanded,
  onAdd,
  onEdit,
  onDelete
}: MenuItemProps) {
  return (
    <div key={item.id} className="relative">
      <div className="relative">
        {level > 0 && (
          <>
            <div 
              className="absolute left-0 w-px bg-gray-200"
              style={{ 
                left: `${level * 20 - 10}px`,
                top: '0',
                bottom: isLastChild ? '12px' : '0',
              }}
            />
            <div 
              className="absolute h-px bg-gray-200"
              style={{ 
                left: `${level * 20 - 10}px`,
                width: '10px',
                top: '12px'
              }}
            />
          </>
        )}
        
        <div
          className="flex items-center py-1.5 relative z-10 group"
          style={{ 
            paddingLeft: `${level * 20}px`,
          }}
        >
          {item.children && item.children.length > 0 ? (
            <ChevronDownIcon className="h-4 w-4 text-gray-400 shrink-0" />
          ) : (
            <div className="w-4" />
          )}
          <span className="ml-1 text-sm text-gray-700">{item.name}</span>
          
          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-blue-100"
              onClick={() => onAdd(item)}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-yellow-100"
              onClick={() => onEdit(item)}
            >
              <Pencil1Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-red-100"
              onClick={() => onDelete(item)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {expanded && item.children && item.children.length > 0 && (
        <div className="relative">
          <div 
            className="absolute left-0 w-px bg-gray-200"
            style={{ 
              left: `${(level + 1) * 20 - 10}px`,
              top: '0',
              bottom: '0',
            }}
          />
          {item.children.map((child, index) => (
            <MenuItemComponent
              key={child.id}
              item={child}
              level={level + 1}
              isLastChild={index === item.children!.length - 1}
              expanded={expanded}
              onAdd={onAdd}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
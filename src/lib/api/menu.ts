const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Get all menus with their items
export async function fetchMenus() {
  const response = await fetch(`${API_URL}/menus`);
  console.log(response);
  
  if (!response.ok) {
    throw new Error('Failed to fetch menus');
  }
  return response.json();
}

// Get a specific menu with its hierarchical structure
export async function getMenu(id: number) {
  const response = await fetch(`${API_URL}/menu/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch menu');
  }
  return response.json();
}

// Create a new menu
export async function createMenu(name: string) {
  const response = await fetch(`${API_URL}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error('Failed to create menu');
  }
  return response.json();
}

// Add a menu item
export async function createMenuItem(data: {
  name: string;
  parentId: string | null;
  order: number;
}) {
  const response = await fetch(`${API_URL}/menus`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create menu item');
  }
  return response.json();
}

// Update a menu item
export async function updateMenuItem(id: string, data: { name: string }) {
  const response = await fetch(`${API_URL}/menus/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update menu item');
  }
  return response.json();
}

// Delete a menu item
export async function deleteMenuItem(id: string) {
  const response = await fetch(`${API_URL}/menus/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete menu item');
  }
  return response.json();
} 
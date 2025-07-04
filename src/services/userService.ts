import { User } from '../types';

// Initial users for demonstration
const initialUsers: User[] = [
  {
    id: 'user_1',
    username: 'Alice',
    status: 'online',
    joinedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
  },
  {
    id: 'user_2',
    username: 'Bob',
    status: 'away',
    joinedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
  },
  {
    id: 'user_3',
    username: 'Charlie',
    status: 'offline',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
  },
  {
    id: 'user_4',
    username: 'Diana',
    status: 'online',
    joinedAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana'
  },
  {
    id: 'user_5',
    username: 'Eve',
    status: 'online',
    joinedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eve'
  }
];

class UserService {
  private users: Map<string, User> = new Map();

  constructor() {
    // Initialize with some users
    initialUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  // Get all users
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Get user by ID
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  // Add a new user
  addUser(user: User): void {
    this.users.set(user.id, user);
  }

  // Update user
  updateUser(user: User): void {
    this.users.set(user.id, user);
  }

  // Remove user
  removeUser(userId: string): void {
    this.users.delete(userId);
  }

  // Update user status
  updateUserStatus(userId: string, status: 'online' | 'offline' | 'away'): void {
    const user = this.users.get(userId);
    if (user) {
      user.status = status;
      this.users.set(userId, user);
    }
  }

  // Get online users
  getOnlineUsers(): User[] {
    return Array.from(this.users.values()).filter(user => user.status === 'online');
  }

  // Get users by status
  getUsersByStatus(status: 'online' | 'offline' | 'away'): User[] {
    return Array.from(this.users.values()).filter(user => user.status === status);
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService; 
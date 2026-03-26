import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();

    // Add a hardcoded user for testing
    const hardcodedUser: User = {
      id: "1",
      username: "testuser",
      password: "password123", // In production, hash passwords!
      role: "admin",
    };
    this.users.set(hardcodedUser.id, hardcodedUser);

    // Add additional hardcoded users for testing
    const evangelistUser: User = {
      id: "2",
      username: "evangelist",
      password: "evangelist123", // In production, hash passwords!
      role: "evangelist",
    };
    this.users.set(evangelistUser.id, evangelistUser);

    const pastorUser: User = {
      id: "3",
      username: "pastor",
      password: "pastor123", // In production, hash passwords!
      role: "pastor",
    };
    this.users.set(pastorUser.id, pastorUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();

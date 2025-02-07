import { User, InsertUser, ChatMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  addMessage(message: Omit<ChatMessage, "id">): Promise<ChatMessage>;
  getMessages(): Promise<ChatMessage[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: ChatMessage[];
  private currentId: number;
  private currentMessageId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.messages = [];
    this.currentId = 1;
    this.currentMessageId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add hardcoded users
    this.createUser({
      username: "taha",
      password: "badar",
    });
    this.createUser({
      username: "glooby",
      password: "glooby",
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async addMessage(message: Omit<ChatMessage, "id">): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const newMessage: ChatMessage = { ...message, id };
    this.messages.push(newMessage);
    return newMessage;
  }

  async getMessages(): Promise<ChatMessage[]> {
    return this.messages;
  }
}

export const storage = new MemStorage();

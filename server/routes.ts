import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // User registration
  app.post("/api/signup", async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "Username already exists" });
    }
    // NOTE: In production, hash the password!
    const user = await storage.createUser({ username, password, role });
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  });

  // User login
  app.post("/api/signin", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ id: user.id, username: user.username, role: user.role });
  });

  return httpServer;
}

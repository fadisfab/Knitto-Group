import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async loginWithEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await authService.loginWithEmail(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      });
    }
  }

  async loginWithUsername(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        res.status(400).json({ error: 'Username and password are required' });
        return;
      }

      const result = await authService.loginWithUsername(username, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, username } = req.body;
      
      if (!email || !password || !username) {
        res.status(400).json({ error: 'Email, password, and username are required' });
        return;
      }

      const result = await authService.register({ email, password, username });
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  }
}
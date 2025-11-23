import { Request, Response } from 'express';
import { ExternalService } from '../services/external.service';

const externalService = new ExternalService();

export class ExternalController {
  async getPosts(req: Request, res: Response): Promise<void> {
    try {
      const posts = await externalService.getPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to fetch posts' 
      });
    }
  }

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const { title, body, userId } = req.body;
      
      if (!title || !body || !userId) {
        res.status(400).json({ error: 'Title, body, and userId are required' });
        return;
      }

      const post = await externalService.createPost({ title, body, userId });
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to create post' 
      });
    }
  }
}
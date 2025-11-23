import { db } from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/database.models';

export class AuthService {
  async loginWithEmail(email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await db.query(query, [email]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0] as User;
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loginWithUsername(username: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string }> {
    try {
      const query = 'SELECT * FROM users WHERE username = $1';
      const result = await db.query(query, [username]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0] as User;
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async register(userData: Omit<User, 'id' | 'created_at'>): Promise<Omit<User, 'password'>> {
    try {
      const checkUser = await db.query(
        `SELECT * FROM users WHERE email = $1 OR username = $2`, 
        [userData.email, userData.username]
      );
      
      if (checkUser.rows.length > 0) {
        const existingUser = checkUser.rows[0];
        
        if (existingUser.email === userData.email) {
          throw new Error('Email already registered');
        }
        if (existingUser.username === userData.username) {
          throw new Error('Username already taken');
        }
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const query = `
        INSERT INTO users (email, password, username, created_at) 
        VALUES ($1, $2, $3, NOW()) 
        RETURNING id, email, username, created_at
      `;
      
      const result = await db.query(query, [userData.email, hashedPassword, userData.username]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
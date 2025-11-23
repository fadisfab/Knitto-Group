import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class ExternalService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('External API error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  async getPosts(): Promise<any[]> {
    try {
      const response: AxiosResponse = await this.client.get(
        'https://jsonplaceholder.typicode.com/posts'
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createPost(postData: { title: string; body: string; userId: number }): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.post(
        'https://jsonplaceholder.typicode.com/posts',
        postData
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('DatabaseService: Initializing SQLite database...');
      
      // Create or open database
      this.db = await this.sqlite.createConnection('userauth.db', false, 'no-encryption', 1, false);
      await this.db.open();
      
      // Create users table if it doesn't exist
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await this.db.execute(createTableQuery);
      console.log('DatabaseService: Database initialized successfully');
      
      this.isInitialized = true;
    } catch (error) {
      console.error('DatabaseService: Failed to initialize database:', error);
      
      // Fallback to localStorage for web development
      console.log('DatabaseService: Using localStorage fallback');
      this.initializeLocalStorageFallback();
      this.isInitialized = true;
    }
  }

  private initializeLocalStorageFallback(): void {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
  }

  async createUser(name: string, email: string, password: string): Promise<number> {
    await this.initialize();

    try {
      if (this.db) {
        // SQLite implementation
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        const result = await this.db.run(query, [name, email, password]);
        console.log('DatabaseService: User created in SQLite with ID:', result.changes?.lastId);
        return result.changes?.lastId || 0;
      } else {
        // localStorage fallback
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
          id: Date.now(),
          name,
          email,
          password,
          created_at: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log('DatabaseService: User created in localStorage with ID:', newUser.id);
        return newUser.id;
      }
    } catch (error) {
      console.error('DatabaseService: Failed to create user:', error);
      throw new Error('Failed to create user');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.initialize();

    try {
      if (this.db) {
        // SQLite implementation
        const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
        const result = await this.db.query(query, [email]);
        
        if (result.values && result.values.length > 0) {
          const user = result.values[0];
          console.log('DatabaseService: User found in SQLite:', email);
          return user as User;
        }
      } else {
        // localStorage fallback
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find((u: User) => u.email === email);
        if (user) {
          console.log('DatabaseService: User found in localStorage:', email);
          return user;
        }
      }
      
      console.log('DatabaseService: User not found:', email);
      return null;
    } catch (error) {
      console.error('DatabaseService: Failed to get user:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    await this.initialize();

    try {
      if (this.db) {
        // SQLite implementation
        const query = 'SELECT id, name, email, created_at FROM users';
        const result = await this.db.query(query);
        return result.values as User[] || [];
      } else {
        // localStorage fallback
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.map((user: User) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }));
      }
    } catch (error) {
      console.error('DatabaseService: Failed to get all users:', error);
      return [];
    }
  }
}

export const databaseService = new DatabaseService();

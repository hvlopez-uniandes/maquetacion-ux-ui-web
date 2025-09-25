import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id?: number;
  email: string;
  password: string;
  fullName: string;
  createdAt?: string;
}

export interface PomodoroAlarm {
  id?: number;
  userId: number;
  name: string;
  uptime: number; // in minutes
  downtime: number; // in minutes
  repetitions: number;
  createdAt?: string;
}

export interface PomodoroSession {
  id?: number;
  alarmId: number;
  userId: number;
  completedAt: string;
  totalDuration: number; // in minutes
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private db: any;
  private usersSubject = new BehaviorSubject<User[]>([]);
  private alarmsSubject = new BehaviorSubject<PomodoroAlarm[]>([]);
  private sessionsSubject = new BehaviorSubject<PomodoroSession[]>([]);

  public users$ = this.usersSubject.asObservable();
  public alarms$ = this.alarmsSubject.asObservable();
  public sessions$ = this.sessionsSubject.asObservable();

  constructor() {
    this.initDatabase();
  }

  private async initDatabase() {
    try {
      // For browser environment, we'll use IndexedDB as a fallback
      // In a real application, you'd typically use a backend API
      this.db = await this.createIndexedDB();
      await this.createTables();
      await this.loadUsers();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  private createIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PomodoroApp', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          store.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('alarms')) {
          const store = db.createObjectStore('alarms', { keyPath: 'id', autoIncrement: true });
          store.createIndex('userId', 'userId', { unique: false });
        }

        if (!db.objectStoreNames.contains('sessions')) {
          const store = db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('alarmId', 'alarmId', { unique: false });
        }
      };
    });
  }

  private async createTables() {
    // Tables are created in onupgradeneeded
    console.log('Database tables created');
    await this.createSampleData();
  }

  private   async clearAllData() {
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db.transaction(['users', 'alarms', 'sessions'], 'readwrite');

      const clearStore = (storeName: string) => {
        return new Promise<void>((storeResolve, storeReject) => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          request.onsuccess = () => storeResolve();
          request.onerror = () => storeReject(request.error);
        });
      };

      Promise.all([
        clearStore('users'),
        clearStore('alarms'),
        clearStore('sessions')
      ]).then(() => {
        this.usersSubject.next([]);
        this.alarmsSubject.next([]);
        this.sessionsSubject.next([]);
        resolve();
      }).catch(reject);
    });
  }

  async createSampleData(forceRecreate = false, targetUserId?: number) {
    try {
      let sampleUser;

      if (forceRecreate && targetUserId) {
        // Clear existing data for the target user
        await this.clearUserData(targetUserId);
        sampleUser = { id: targetUserId };
      } else if (forceRecreate) {
        // Clear all data and create demo user
        await this.clearAllData();
        sampleUser = await this.createUser({
          email: 'demo@example.com',
          password: 'password123',
          fullName: 'Usuario Demo'
        });
      } else {
        // Check if we already have data
        const existingUsers = await this.getAllUsers();
        if (existingUsers.length > 0) return;

        // Create sample user
        sampleUser = await this.createUser({
          email: 'demo@example.com',
          password: 'password123',
          fullName: 'Usuario Demo'
        });
      }

      // Create sample alarms
      const alarm1 = await this.createAlarm({
        userId: sampleUser.id!,
        name: 'Pomodoro 1',
        uptime: 25,
        downtime: 5,
        repetitions: 4
      });

      const alarm2 = await this.createAlarm({
        userId: sampleUser.id!,
        name: 'Pomodoro 2',
        uptime: 30,
        downtime: 10,
        repetitions: 3
      });

      // Create sample sessions (achievements)
      const now = new Date();

      // Today's sessions
      await this.createSession({
        alarmId: alarm1.id!,
        userId: sampleUser.id!,
        completedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        totalDuration: 120 // 25min uptime + 5min downtime * 4 repetitions = 120min
      });

      await this.createSession({
        alarmId: alarm2.id!,
        userId: sampleUser.id!,
        completedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        totalDuration: 120 // 30min uptime + 10min downtime * 3 repetitions = 120min
      });

      // Yesterday's sessions
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      await this.createSession({
        alarmId: alarm1.id!,
        userId: sampleUser.id!,
        completedAt: new Date(yesterday.getTime() - 1 * 60 * 60 * 1000).toISOString(), // Yesterday afternoon
        totalDuration: 120
      });

      await this.createSession({
        alarmId: alarm2.id!,
        userId: sampleUser.id!,
        completedAt: new Date(yesterday.getTime() - 3 * 60 * 60 * 1000).toISOString(), // Yesterday morning
        totalDuration: 120
      });

      // 2 days ago
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
      await this.createSession({
        alarmId: alarm1.id!,
        userId: sampleUser.id!,
        completedAt: new Date(twoDaysAgo.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        totalDuration: 120
      });

      // 3 days ago
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      await this.createSession({
        alarmId: alarm2.id!,
        userId: sampleUser.id!,
        completedAt: new Date(threeDaysAgo.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        totalDuration: 120
      });

      await this.createSession({
        alarmId: alarm1.id!,
        userId: sampleUser.id!,
        completedAt: new Date(threeDaysAgo.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        totalDuration: 120
      });

      // 1 week ago
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      await this.createSession({
        alarmId: alarm1.id!,
        userId: sampleUser.id!,
        completedAt: new Date(oneWeekAgo.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        totalDuration: 120
      });

      await this.createSession({
        alarmId: alarm2.id!,
        userId: sampleUser.id!,
        completedAt: new Date(oneWeekAgo.getTime() - 5 * 60 * 60 * 1000).toISOString(),
        totalDuration: 120
      });

      // 2 weeks ago
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      await this.createSession({
        alarmId: alarm1.id!,
        userId: sampleUser.id!,
        completedAt: new Date(twoWeeksAgo.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        totalDuration: 120
      });

      // 1 month ago
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      await this.createSession({
        alarmId: alarm2.id!,
        userId: sampleUser.id!,
        completedAt: new Date(oneMonthAgo.getTime() - 3 * 60 * 60 * 1000).toISOString(),
        totalDuration: 120
      });

      await this.createSession({
        alarmId: alarm1.id!,
        userId: sampleUser.id!,
        completedAt: new Date(oneMonthAgo.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        totalDuration: 120
      });

      console.log('Sample data created successfully');
    } catch (error) {
      console.error('Error creating sample data:', error);
    }
  }

  async clearUserData(userId: number) {
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db.transaction(['alarms', 'sessions'], 'readwrite');

      const clearUserAlarms = () => {
        return new Promise<void>((alarmResolve, alarmReject) => {
          const alarmStore = transaction.objectStore('alarms');
          const alarmIndex = alarmStore.index('userId');
          const alarmRequest = alarmIndex.openCursor(IDBKeyRange.only(userId));

          alarmRequest.onsuccess = (event: Event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              alarmResolve();
            }
          };
          alarmRequest.onerror = () => alarmReject(alarmRequest.error);
        });
      };

      const clearUserSessions = () => {
        return new Promise<void>((sessionResolve, sessionReject) => {
          const sessionStore = transaction.objectStore('sessions');
          const sessionIndex = sessionStore.index('userId');
          const sessionRequest = sessionIndex.openCursor(IDBKeyRange.only(userId));

          sessionRequest.onsuccess = (event: Event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              sessionResolve();
            }
          };
          sessionRequest.onerror = () => sessionReject(sessionRequest.error);
        });
      };

      Promise.all([clearUserAlarms(), clearUserSessions()]).then(() => {
        this.loadAlarms();
        this.loadSessions();
        resolve();
      }).catch(reject);
    });
  }

  async recreateSampleData(targetUserId?: number) {
    await this.createSampleData(true, targetUserId);
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');

      const userWithTimestamp = {
        ...user,
        createdAt: new Date().toISOString()
      };

      const request = store.add(userWithTimestamp);

      request.onsuccess = () => {
        const newUser: User = {
          ...userWithTimestamp,
          id: request.result
        };
        this.loadUsers();
        resolve(newUser);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('email');

      const request = index.get(email);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAllUsers(): Promise<User[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async loadUsers() {
    try {
      const users = await this.getAllUsers();
      this.usersSubject.next(users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  private async loadAlarms() {
    try {
      const alarms = await this.getAllAlarms();
      this.alarmsSubject.next(alarms);
    } catch (error) {
      console.error('Error loading alarms:', error);
    }
  }

  private async loadSessions() {
    try {
      const sessions = await this.getAllSessions();
      this.sessionsSubject.next(sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  // Alarm methods
  async createAlarm(alarm: Omit<PomodoroAlarm, 'id'>): Promise<PomodoroAlarm> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['alarms'], 'readwrite');
      const store = transaction.objectStore('alarms');

      const alarmWithTimestamp = {
        ...alarm,
        createdAt: new Date().toISOString()
      };

      const request = store.add(alarmWithTimestamp);

      request.onsuccess = () => {
        const newAlarm: PomodoroAlarm = {
          ...alarmWithTimestamp,
          id: request.result
        };
        this.loadAlarms();
        resolve(newAlarm);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async updateAlarm(id: number, alarm: Partial<PomodoroAlarm>): Promise<PomodoroAlarm> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['alarms'], 'readwrite');
      const store = transaction.objectStore('alarms');

      // First get the existing alarm to preserve userId
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const existingAlarm = getRequest.result;
        if (!existingAlarm) {
          reject(new Error('Alarm not found'));
          return;
        }

        // Update with new data while preserving userId
        const updatedAlarm = {
          ...existingAlarm,
          ...alarm,
          id,
          userId: existingAlarm.userId // Preserve the original userId
        };

        const putRequest = store.put(updatedAlarm);

        putRequest.onsuccess = () => {
          this.loadAlarms();
          resolve(updatedAlarm);
        };

        putRequest.onerror = () => {
          reject(new Error('Failed to update alarm'));
        };
      };

      getRequest.onerror = () => {
        reject(new Error('Failed to get alarm'));
      };
    });
  }

  async deleteAlarm(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['alarms'], 'readwrite');
      const store = transaction.objectStore('alarms');

      const request = store.delete(id);

      request.onsuccess = () => {
        this.loadAlarms();
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAlarmsByUser(userId: number): Promise<PomodoroAlarm[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['alarms'], 'readonly');
      const store = transaction.objectStore('alarms');
      const index = store.index('userId');

      const request = index.getAll(userId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAllAlarms(): Promise<PomodoroAlarm[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['alarms'], 'readonly');
      const store = transaction.objectStore('alarms');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  // Session methods
  async createSession(session: Omit<PomodoroSession, 'id'>): Promise<PomodoroSession> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');

      const request = store.add(session);

      request.onsuccess = () => {
        const newSession: PomodoroSession = {
          ...session,
          id: request.result
        };
        this.loadSessions();
        resolve(newSession);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getSessionsByUser(userId: number): Promise<PomodoroSession[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('userId');

      const request = index.getAll(userId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getSessionsByAlarm(alarmId: number): Promise<PomodoroSession[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('alarmId');

      const request = index.getAll(alarmId);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getAllSessions(): Promise<PomodoroSession[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => reject(request.error);
    });
  }
}

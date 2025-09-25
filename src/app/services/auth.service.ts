import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DatabaseService, User } from './database.service';

export type { User } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private databaseService: DatabaseService) {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const user = await this.databaseService.validateUser(email, password);

      if (user) {
        this.currentUserSubject.next(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, message: 'Login exitoso', user };
      } else {
        return { success: false, message: 'Credenciales incorrectas' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Error al iniciar sesión' };
    }
  }

  async register(fullName: string, email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Check if user already exists
      const existingUser = await this.databaseService.getUserByEmail(email);

      if (existingUser) {
        return { success: false, message: 'El correo electrónico ya está registrado' };
      }

      // Create new user
      const newUser = await this.databaseService.createUser({
        fullName,
        email,
        password
      });

      this.currentUserSubject.next(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));

      return { success: true, message: 'Registro exitoso', user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Error al registrar usuario' };
    }
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}

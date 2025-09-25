import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatabaseService, PomodoroSession, User } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './achievements.html',
  styleUrl: './achievements.scss'
})
export class AchievementsComponent implements OnInit {
  sessions: PomodoroSession[] = [];
  currentUser: User | null = null;
  isLoading = false;
  Math = Math;

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadSessions();
    }
  }

  async loadSessions() {
    if (!this.currentUser) return;

    try {
      this.isLoading = true;
      this.sessions = await this.databaseService.getSessionsByUser(this.currentUser.id!);
    } catch (error) {
      console.error('Error loading sessions:', error);
      this.snackBar.open('Error al cargar los logros', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  openSessionHistory(session: PomodoroSession) {
    // TODO: Implement session history dialog
    this.snackBar.open('Funcionalidad de historial próximamente', 'Cerrar', { duration: 3000 });
  }

  trackBySessionId(index: number, session: PomodoroSession): number {
    return session.id || index;
  }
}

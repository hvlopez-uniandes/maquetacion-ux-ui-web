import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatabaseService, PomodoroSession, User, PomodoroAlarm } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';
import { AlarmHistoryComponent, HistoryModalData } from '../alarm-history/alarm-history';

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
  alarms: PomodoroAlarm[] = [];
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
      this.loadAlarms();
    }
  }

  async loadSessions() {
    if (!this.currentUser) return;

    try {
      this.isLoading = true;
      console.log('Loading sessions for user:', this.currentUser.id);
      this.sessions = await this.databaseService.getSessionsByUser(this.currentUser.id!);
      console.log('Loaded sessions:', this.sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      this.snackBar.open('Error al cargar los logros', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  async loadAlarms() {
    if (!this.currentUser) return;

    try {
      console.log('Loading alarms for user:', this.currentUser.id);
      this.alarms = await this.databaseService.getAlarmsByUser(this.currentUser.id!);
      console.log('Loaded alarms:', this.alarms);
    } catch (error) {
      console.error('Error loading alarms:', error);
    }
  }

  openSessionHistory(session: PomodoroSession) {
    console.log('Opening session history for session:', session);
    console.log('Available alarms:', this.alarms);
    console.log('Looking for alarm with ID:', session.alarmId);

    // Find the alarm for this session
    const alarm = this.alarms.find(a => a.id === session.alarmId);

    if (!alarm) {
      console.error('Alarm not found for session:', session);
      this.snackBar.open('No se encontró la alarma asociada', 'Cerrar', { duration: 3000 });
      return;
    }

    console.log('Found alarm:', alarm);

    const dialogData: HistoryModalData = {
      alarm: alarm
    };

    const dialogRef = this.dialog.open(AlarmHistoryComponent, {
      width: '600px',
      maxHeight: '80vh',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      // Dialog closed
    });
  }

  async recreateSampleData() {
    try {
      this.isLoading = true;

      if (this.currentUser) {
        // Create sample data for the current user
        await this.databaseService.recreateSampleData(this.currentUser.id!);
        this.snackBar.open('¡Datos de muestra recreados exitosamente!', 'Cerrar', { duration: 3000 });

        // Reload data
        await this.loadSessions();
        await this.loadAlarms();
      } else {
        this.snackBar.open('Usuario no autenticado', 'Cerrar', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error recreating sample data:', error);
      this.snackBar.open('Error al recrear los datos de muestra', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  trackBySessionId(index: number, session: PomodoroSession): number {
    return session.id || index;
  }
}

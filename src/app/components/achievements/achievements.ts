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
      this.sessions = await this.databaseService.getSessionsByUser(this.currentUser.id!);
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
      this.alarms = await this.databaseService.getAlarmsByUser(this.currentUser.id!);
    } catch (error) {
      console.error('Error loading alarms:', error);
    }
  }

  openSessionHistory(session: PomodoroSession) {
    // Find the alarm for this session
    const alarm = this.alarms.find(a => a.id === session.alarmId);

    if (!alarm) {
      this.snackBar.open('No se encontró la alarma asociada', 'Cerrar', { duration: 3000 });
      return;
    }

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

  trackBySessionId(index: number, session: PomodoroSession): number {
    return session.id || index;
  }
}

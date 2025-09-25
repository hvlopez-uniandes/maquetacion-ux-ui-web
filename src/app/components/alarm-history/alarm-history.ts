import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { DatabaseService, PomodoroAlarm, PomodoroSession } from '../../services/database.service';

export interface HistoryModalData {
  alarm: PomodoroAlarm;
}

@Component({
  selector: 'app-alarm-history',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './alarm-history.html',
  styleUrl: './alarm-history.scss'
})
export class AlarmHistoryComponent implements OnInit {
  sessions: PomodoroSession[] = [];
  isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<AlarmHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HistoryModalData,
    private databaseService: DatabaseService
  ) {}

  ngOnInit() {
    this.loadSessions();
  }

  async loadSessions() {
    try {
      this.isLoading = true;
      this.sessions = await this.databaseService.getSessionsByAlarm(this.data.alarm.id!);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      this.isLoading = false;
    }
  }

  get title(): string {
    return `Mi historial de Alarmas`;
  }

  get description(): string {
    return `Acá podrás ver tu historial de ejecuciones de la alarma ${this.data.alarm.name} detalle, siéntete libre de dar click en "Ver más".`;
  }

  closeDialog() {
    this.dialogRef.close();
  }

  trackBySessionId(index: number, session: PomodoroSession): number {
    return session.id || index;
  }
}

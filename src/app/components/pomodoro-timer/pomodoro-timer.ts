import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatabaseService, PomodoroAlarm, PomodoroSession } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

export interface TimerModalData {
  alarm: PomodoroAlarm;
}

@Component({
  selector: 'app-pomodoro-timer',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './pomodoro-timer.html',
  styleUrl: './pomodoro-timer.scss'
})
export class PomodoroTimerComponent implements OnInit, OnDestroy {
  currentPhase: 'uptime' | 'downtime' = 'uptime';
  currentRepetition = 1;
  timeRemaining = 0;
  isRunning = false;
  isPaused = false;
  intervalId: any;
  totalDuration = 0;

  constructor(
    private dialogRef: MatDialogRef<PomodoroTimerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TimerModalData,
    private databaseService: DatabaseService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  get title(): string {
    if (this.currentPhase === 'uptime') {
      return `Uptime (Repetición ${this.currentRepetition})`;
    } else {
      return `Downtime (Repetición ${this.currentRepetition})`;
    }
  }

  get instruction(): string {
    if (this.currentPhase === 'uptime') {
      return 'Durante este tiempo realice la actividad deseada.';
    } else {
      return 'Durante este tiempo realice una pausa.';
    }
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  startTimer() {
    this.currentPhase = 'uptime';
    this.currentRepetition = 1;
    this.timeRemaining = this.data.alarm.uptime * 60; // Convert to seconds
    this.isRunning = true;
    this.isPaused = false;
    this.startCountdown();
  }

  startCountdown() {
    this.intervalId = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
        this.totalDuration++;
      } else {
        this.nextPhase();
      }
    }, 1000);
  }

  nextPhase() {
    if (this.currentPhase === 'uptime') {
      // Switch to downtime
      this.currentPhase = 'downtime';
      this.timeRemaining = this.data.alarm.downtime * 60;

      // Show notification for break
      this.snackBar.open('¡Tiempo de descanso!', 'Cerrar', { duration: 3000 });
    } else {
      // Switch to next uptime or finish
      this.currentRepetition++;

      if (this.currentRepetition > this.data.alarm.repetitions) {
        this.finishSession();
        return;
      }

      this.currentPhase = 'uptime';
      this.timeRemaining = this.data.alarm.uptime * 60;

      // Show notification for work
      this.snackBar.open('¡Tiempo de trabajo!', 'Cerrar', { duration: 3000 });
    }
  }

  async finishSession() {
    clearInterval(this.intervalId);
    this.isRunning = false;

    // Save session to database
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      try {
        await this.databaseService.createSession({
          alarmId: this.data.alarm.id!,
          userId: currentUser.id!,
          completedAt: new Date().toISOString(),
          totalDuration: Math.floor(this.totalDuration / 60) // Convert to minutes
        });

        this.snackBar.open('¡Sesión completada con éxito!', 'Cerrar', { duration: 3000 });
      } catch (error) {
        console.error('Error saving session:', error);
      }
    }

    // Close dialog after a short delay
    setTimeout(() => {
      this.dialogRef.close(true);
    }, 2000);
  }

  pauseTimer() {
    if (this.isRunning) {
      clearInterval(this.intervalId);
      this.isPaused = true;
    }
  }

  resumeTimer() {
    if (this.isPaused) {
      this.startCountdown();
      this.isPaused = false;
    }
  }

  continueTimer() {
    if (this.isPaused) {
      this.resumeTimer();
    } else if (!this.isRunning) {
      this.startTimer();
    }
  }

  closeDialog() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.dialogRef.close(false);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatabaseService, PomodoroAlarm, User } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-alarms',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './alarms.html',
  styleUrl: './alarms.scss'
})
export class AlarmsComponent implements OnInit {
  alarms: PomodoroAlarm[] = [];
  currentUser: User | null = null;
  isLoading = false;

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadAlarms();
    }
  }

  async loadAlarms() {
    if (!this.currentUser) return;

    try {
      this.isLoading = true;
      this.alarms = await this.databaseService.getAlarmsByUser(this.currentUser.id!);
    } catch (error) {
      console.error('Error loading alarms:', error);
      this.snackBar.open('Error al cargar las alarmas', 'Cerrar', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  openCreateAlarmDialog() {
    // TODO: Implement create alarm dialog
    this.snackBar.open('Funcionalidad de crear alarma próximamente', 'Cerrar', { duration: 3000 });
  }

  openEditAlarmDialog(alarm: PomodoroAlarm) {
    // TODO: Implement edit alarm dialog
    this.snackBar.open('Funcionalidad de editar alarma próximamente', 'Cerrar', { duration: 3000 });
  }

  async deleteAlarm(alarm: PomodoroAlarm) {
    if (confirm(`¿Está seguro de que desea eliminar la alarma "${alarm.name}"? Una vez ejecutada esta acción no podrá deshacerla.`)) {
      try {
        await this.databaseService.deleteAlarm(alarm.id!);
        this.snackBar.open('¡Felicidades, su alarma ha sido eliminada con éxito!', 'Cerrar', { duration: 3000 });
        this.loadAlarms();
      } catch (error) {
        console.error('Error deleting alarm:', error);
        this.snackBar.open('Error al eliminar la alarma', 'Cerrar', { duration: 3000 });
      }
    }
  }

  startAlarm(alarm: PomodoroAlarm) {
    // TODO: Implement start alarm functionality
    this.snackBar.open('Funcionalidad de iniciar alarma próximamente', 'Cerrar', { duration: 3000 });
  }

  trackByAlarmId(index: number, alarm: PomodoroAlarm): number {
    return alarm.id || index;
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DatabaseService, PomodoroAlarm } from '../../services/database.service';
import { AuthService } from '../../services/auth.service';

export interface AlarmModalData {
  alarm?: PomodoroAlarm;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-alarm-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './alarm-modal.html',
  styleUrl: './alarm-modal.scss'
})
export class AlarmModalComponent implements OnInit {
  alarmForm: FormGroup;
  isSubmitting = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AlarmModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AlarmModalData,
    private databaseService: DatabaseService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.alarmForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      uptime: [25, [Validators.required, Validators.min(1), Validators.max(120)]],
      downtime: [5, [Validators.required, Validators.min(1), Validators.max(60)]],
      repetitions: [4, [Validators.required, Validators.min(1), Validators.max(20)]]
    });
  }

  ngOnInit() {
    if (this.data.mode === 'edit' && this.data.alarm) {
      this.alarmForm.patchValue({
        name: this.data.alarm.name,
        uptime: this.data.alarm.uptime,
        downtime: this.data.alarm.downtime,
        repetitions: this.data.alarm.repetitions
      });
    }
  }

  get title(): string {
    return this.data.mode === 'create' ? 'Crear Alarma' : 'Modificar Alarma';
  }

  get submitButtonText(): string {
    return this.data.mode === 'create' ? 'Crear Alarma' : 'Modificar Alarma';
  }

  async onSubmit() {
    if (this.alarmForm.valid) {
      this.isSubmitting = true;
      const currentUser = this.authService.getCurrentUser();

      if (!currentUser) {
        this.snackBar.open('Usuario no autenticado', 'Cerrar', { duration: 3000 });
        return;
      }

      try {
        const formData = this.alarmForm.value;

        if (this.data.mode === 'create') {
          await this.databaseService.createAlarm({
            userId: currentUser.id!,
            name: formData.name,
            uptime: formData.uptime,
            downtime: formData.downtime,
            repetitions: formData.repetitions
          });
          this.successMessage = '¡Felicidades, su alarma ha sido creada con éxito!';
        } else if (this.data.mode === 'edit' && this.data.alarm) {
          console.log('Updating alarm:', this.data.alarm.id, formData);
          const updatedAlarm = await this.databaseService.updateAlarm(this.data.alarm.id!, {
            name: formData.name,
            uptime: formData.uptime,
            downtime: formData.downtime,
            repetitions: formData.repetitions
          });
          console.log('Alarm updated successfully:', updatedAlarm);
          this.successMessage = '¡Felicidades, su alarma ha sido modificada con éxito!';
        }

        // Show success message for 2 seconds, then close
        setTimeout(() => {
          this.dialogRef.close(true);
        }, 2000);

      } catch (error) {
        console.error('Error saving alarm:', error);
        this.snackBar.open('Error al guardar la alarma', 'Cerrar', { duration: 3000 });
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.snackBar.open('Por favor, completa todos los campos correctamente', 'Cerrar', { duration: 3000 });
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  closeDialog() {
    this.dialogRef.close(false);
  }
}

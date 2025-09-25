import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      fullName: ['test', [Validators.required, Validators.minLength(2)]],
      email: ['test@gmail.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['123456', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  async onSubmit() {
    // Mark all fields as touched to show validation errors
    this.registerForm.markAllAsTouched();

    if (this.registerForm.valid) {
      this.isLoading = true;
      const { fullName, email, password } = this.registerForm.value;

      const result = await this.authService.register(fullName, email, password);

      if (result.success) {
        this.snackBar.open(result.message, 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      } else {
        this.snackBar.open(result.message, 'Cerrar', { duration: 3000 });
      }

      this.isLoading = false;
    } else {
      // Get specific validation errors
      const errors = this.getValidationErrors();
      this.snackBar.open(errors, 'Cerrar', { duration: 5000 });
    }
  }

  private getValidationErrors(): string {
    const errors: string[] = [];

    if (this.registerForm.get('fullName')?.hasError('required')) {
      errors.push('El nombre completo es requerido');
    }
    if (this.registerForm.get('fullName')?.hasError('minlength')) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (this.registerForm.get('email')?.hasError('required')) {
      errors.push('El correo electrónico es requerido');
    }
    if (this.registerForm.get('email')?.hasError('email')) {
      errors.push('Ingresa un correo electrónico válido');
    }
    if (this.registerForm.get('password')?.hasError('required')) {
      errors.push('La contraseña es requerida');
    }
    if (this.registerForm.get('password')?.hasError('minlength')) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    if (this.registerForm.get('confirmPassword')?.hasError('required')) {
      errors.push('La confirmación de contraseña es requerida');
    }
    if (this.registerForm.hasError('passwordMismatch')) {
      errors.push('Las contraseñas no coinciden');
    }

    return errors.length > 0 ? errors.join('. ') : 'Por favor, completa todos los campos correctamente';
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}

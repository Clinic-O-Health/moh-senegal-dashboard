import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DirectusService } from '../../../core/services/directus.service';
import { isDirectusError } from '@directus/sdk';
import { formatDirectusError } from '@shared/helpers/utils';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    CardModule,
    Toast,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['philippesteve2.ps+test2@gmail.com', [Validators.required, Validators.email]],
      password: ['Qwerty123$', [Validators.required, Validators.minLength(3)]],
      rememberMe: [false],
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Connexion réussie',
            detail: 'Bienvenue sur la plateforme MNT',
          });

          // Rediriger vers l'URL d'origine ou le dashboard
          const returnUrl = '/admin/dashboard';
          // localStorage.removeItem('returnUrl');

          setTimeout(() => {
            this.router.navigate([returnUrl]);
          }, 1000);
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = 'Email ou mot de passe incorrect';

          if (error.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur';
          } else if (error.error?.errors?.[0]?.message) {
            errorMessage = error.error.errors[0].message;
          }

          this.messageService.add({
            severity: 'error',
            summary: 'Erreur de connexion',
            detail: errorMessage,
          });
        },
      });
    }
  }

  goToRegister() {
    this.router.navigate(['/authentication/registration']);
  }
}

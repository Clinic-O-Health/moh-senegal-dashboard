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
import { isDirectusError } from '@directus/sdk';
import { formatDirectusError } from '@shared/helpers/utils';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgotten-password',
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
  templateUrl: './forgotten-password.component.html',
  styleUrl: './forgotten-password.component.scss',
})
export class ForgottenPasswordComponent {
  forgottenPassForm: FormGroup;
  isLoading = false;
  requestSent = false;
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly authService: AuthService
  ) {
    this.forgottenPassForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async onLogin() {
    if (this.forgottenPassForm.valid) {
      this.isLoading = true;
      this.authService.resetPasswordRequest(this.forgottenPassForm.value.email).subscribe({
        next: (result) => {
          this.isLoading = false;
          if (result) {
            this.messageService.add({
              severity: 'success',
              summary: 'Compte créé',
              detail:
                'La demand de reinitialisation de mot se passe a ete prise en compte. Vous allez recevoir un mail avec les instructions a suivre',
            });
            this.requestSent = true;
            this.isLoading = false;
            setTimeout(() => {
              this.router.navigate(['/authentication/verify-forgotten-password'], {
                queryParams: { email: this.forgottenPassForm.get('email')?.value },
              });
            }, 2000);
          }
        },
        error: (error) => {
          console.log(error)
          this.isLoading = false;
          if (isDirectusError(error)) {
            this.messageService.add(formatDirectusError(error));
          }
        },
      });
    }
  }

  goToLogin() {
    this.router.navigate(['/authentication/login']);
  }
}

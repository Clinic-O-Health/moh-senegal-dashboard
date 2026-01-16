import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DirectusService } from '@core/services/directus.service';
import { AuthService } from '@core/services/auth.service';
import { isDirectusError } from '@directus/sdk';
import { formatDirectusError } from '@shared/helpers/utils';

@Component({
  selector: 'app-validate-forgotten-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    SelectModule,
    CardModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './validate-forgotten-password.component.html',
})
export class ValidateForgottenPasswordComponent implements OnInit {
  forgottenPassForm: FormGroup;
  isLoading = false;
  accountCreated = false;
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly directusService: DirectusService,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
  ) {
    this.forgottenPassForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        token: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params: any) => {
      const email = params['email'];
      const token = params['token'];
      if (email) {
        this.forgottenPassForm.get('email')?.setValue(email);
      }
      if (token) {
        this.forgottenPassForm.get('token')?.setValue(token);
      }
    });
  }
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onRegister() {
    if (this.forgottenPassForm.valid) {
      console.log('Form Values:', this.forgottenPassForm.value);
      const formValues = this.forgottenPassForm.value;
      delete formValues.confirmPassword;
      this.isLoading = true;
      this.authService.validatePasswordReset(formValues.token, formValues.email, formValues.password).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Mot de passe réinitialisé',
            detail: 'Votre mot de passe a été réinitialisé avec succès.',
          });
          setTimeout(() => {
            this.router.navigate(['/authentication/login']);
          }, 2000);
        },
        error: (error) => {
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

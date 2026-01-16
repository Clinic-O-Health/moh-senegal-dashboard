import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-validate-account',
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
  templateUrl: './validate-account.component.html',
  styleUrl: './validate-account.component.scss',
})
export class ValidateAccountComponent implements OnInit {
  tokenForm: FormGroup;
  isLoading = false;
  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly messageService: MessageService,
    private readonly authService: AuthService
  ) {
    this.tokenForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const email = params['email'];
      const token = params['token'];
      if (email) {
        this.tokenForm.get('email')?.setValue(email);
      }
      if (token) {
        this.tokenForm.get('token')?.setValue(token);
      }
    });
  }
  async onLogin() {
    if (this.tokenForm.valid) {
      this.isLoading = true;
      this.authService
        .verifyAccount(this.tokenForm.get('token')?.value, this.tokenForm.get('email')?.value)
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Compte vérifié',
              detail: 'Votre compte a été vérifié avec succès.',
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

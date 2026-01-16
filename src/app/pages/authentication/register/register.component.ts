import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DirectusService } from '@core/services/directus.service';
import { createUser, isDirectusError, readRoles } from '@directus/sdk';
import { formatDirectusError } from '@shared/helpers/utils';

interface Role {
  label: string;
  value: string;
}

interface Region {
  label: string;
  value: string;
}

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  accountCreated = false;
  roles: Role[] = [
    { label: 'Acteur Communautaire de Santé (ACS)', value: 'ACS' },
    { label: 'Infirmier Chef de Poste (ICP)', value: 'ICP' },
    { label: 'Sage-femme', value: 'SAGE_FEMME' },
    { label: 'Major', value: 'MAJOR' },
    { label: 'Médecin', value: 'MEDECIN' },
    { label: 'Point Focal SC/DS', value: 'PF_SC' },
  ];

  regions: Region[] = [
    { label: 'Dakar', value: 'dakar' },
    { label: 'Thiès', value: 'thies' },
    { label: 'Saint-Louis', value: 'saint-louis' },
    { label: 'Diourbel', value: 'diourbel' },
    { label: 'Kaolack', value: 'kaolack' },
    { label: 'Ziguinchor', value: 'ziguinchor' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly directusService: DirectusService
  ) {
    this.registerForm = this.fb.group(
      {
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone_number: ['', Validators.required],
        role: ['', Validators.required],
        region: ['', Validators.required],
        status: ['unverified'],
        // district: ['', Validators.required],
        // poste_sante: [''],
        // site_communautaire: [''],
        password: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }
  async ngOnInit(): Promise<void> {
    const roles = await this.directusService.directus.request(readRoles());
    console.log('Roles from Directus:', roles);
    this.roles = roles.map((role: any) => ({
      label: role.name,
      value: role.id,
    }));
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
    if (this.registerForm.valid) {
      console.log('Form Values:', this.registerForm.value);
      const formValues = this.registerForm.value;
      delete formValues.confirmPassword;
      this.isLoading = true;
      try {
        const result = await this.directusService.directus.request(createUser(formValues));
        if (result) {
          this.messageService.add({
            severity: 'success',
            summary: 'Compte créé',
            detail:
              'Votre compte a été créé avec succès. Vous allez recevoir un mail avec le code de confirmation.',
          });
          this.accountCreated = true;
          setTimeout(() => {
            this.router.navigate(['/authentication/validate-account'], {
              queryParams: { email: encodeURIComponent(this.registerForm.get('email')?.value) },
            });
          }, 2000);
        }
      } catch (error) {
        this.isLoading = false;
        if (isDirectusError(error)) {
          this.messageService.add(formatDirectusError(error));
        }
      }
    }
  }

  goToLogin() {
    this.router.navigate(['/authentication/login']);
  }
}

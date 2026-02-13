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
import { CheckboxModule } from 'primeng/checkbox';

interface Role {
  label: string;
  value: string;
}

interface Quartier {
  label: string;
  value: string;
}

interface Commune {
  label: string;
  value: string;
  quartiers: Quartier[];
}

interface Region {
  label: string;
  value: string;
  communes: Commune[];
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
    CheckboxModule,
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

  selectedRegion: Region | null = null;
  selectedCommune: Commune | null = null;

  roles: Role[] = [
    { label: 'Acteur Communautaire de Santé (ACS)', value: 'ACS' },
    { label: 'Infirmier Chef de Poste (ICP)', value: 'ICP' },
    { label: 'Sage-femme', value: 'SAGE_FEMME' },
    { label: 'Major', value: 'MAJOR' },
    { label: 'Médecin', value: 'MEDECIN' },
    { label: 'Point Focal SC/DS', value: 'PF_SC' },
  ];

  regions: Region[] = [
    {
      label: 'Dakar',
      value: 'dakar',
      communes: [
        {
          label: 'Plateau',
          value: 'plateau',
          quartiers: [
            { label: 'Plateau', value: 'plateau' },
            { label: 'Mermoz', value: 'mermoz' },
            { label: 'Sicap-Liberté', value: 'sicap-liberte' },
          ],
        },
        {
          label: 'Yoff',
          value: 'yoff',
          quartiers: [
            { label: 'Yoff', value: 'yoff' },
            { label: 'Ouakam', value: 'ouakam' },
            { label: 'Ngor', value: 'ngor' },
          ],
        },
        {
          label: 'Pikine',
          value: 'pikine',
          quartiers: [
            { label: 'Pikine Est', value: 'pikine-est' },
            { label: 'Pikine Ouest', value: 'pikine-ouest' },
            { label: 'Pikine Centre', value: 'pikine-centre' },
          ],
        },
        {
          label: 'Guédiawaye',
          value: 'guediawaye',
          quartiers: [
            { label: 'Guédiawaye', value: 'guediawaye' },
            { label: 'Sam Notaire', value: 'sam-notaire' },
            { label: 'Wakhinane', value: 'wakhinane' },
          ],
        },
      ],
    },
    {
      label: 'Thiès',
      value: 'Thiès',
      communes: [
        {
          label: 'Khombole',
          value: 'Khombole',
          quartiers: [
            { label: 'Touba Toulé', value: 'Touba Toulé' },
            { label: 'Thilla Ounté', value: 'Thilla Ounté' },
            { label: 'Refane Souf', value: 'Refane Souf' },
            { label: 'Kaba', value: 'Kaba' },
            { label: 'Ndouf', value: 'Ndouf' },
            { label: 'Taiba Ndao', value: 'Taiba Ndao' },
            { label: 'Babou', value: 'Babou' },
            { label: 'Ndingler', value: 'Ndingler' },
            { label: 'Biram Fall', value: 'Biram Fall' },
            { label: 'Dieyene', value: 'Dieyene' },
            { label: 'Ngoudiane', value: 'Ngoudiane' },
            { label: 'Thiarr', value: 'Thiarr' },
            { label: 'Mbossobe', value: 'Mbossobe' },
            { label: 'Ndié Ngom', value: 'Ndié Ngom' },
            { label: 'Darou Ndiaye', value: 'Darou Ndiaye' },
            { label: 'Keur Banda Niang', value: 'Keur Banda Niang' },
            { label: 'Diokoul', value: 'Diokoul' },
            { label: 'Diak', value: 'Diak' },
            { label: 'Diol Baba', value: 'Diol Baba' },
            { label: 'Ndionguène', value: 'Ndionguène' },
            { label: 'Ndiéffoune', value: 'Ndiéffoune' },
            { label: 'Tigad', value: 'Tigad' },
          ],
        },
      ],
    },
  ];

  centres: { label: string; value: string }[] = [
    { label: 'Le centre de santé de khombole', value: 'Le centre de santé de khombole' },
    { label: 'Seokhaye', value: 'Seokhaye' },
    { label: 'Ndoudigne', value: 'Ndoudigne' },
    { label: 'Thiagave', value: 'Thiagave' },
    { label: 'Mbourouaille', value: 'Mbourouaille' },
    { label: 'Diack', value: 'Diack' },
    { label: 'Mbayang diack', value: 'Mbayang diack' },
    { label: 'Thienaba', value: 'Thienaba' },
    { label: 'Keur yaba diop', value: 'Keur yaba diop' },
    { label: 'Bangadji', value: 'Bangadji' },
    { label: 'Digyane', value: 'Digyane' },
    { label: 'Ndouff ndingeler', value: 'Ndouff ndingeler' },
    { label: 'Ndieyenne sirakh', value: 'Ndieyenne sirakh' },
    { label: 'Mbewane', value: 'Mbewane' },
    { label: 'Mboulouctene', value: 'Mboulouctene' },
    { label: 'Touba toul', value: 'Touba toul' },
    { label: 'Boss', value: 'Boss' },
    { label: 'Ndoucoumane', value: 'Ndoucoumane' },
    { label: 'Keur ibra gueye', value: 'Keur ibra gueye' },
    { label: 'Bokh', value: 'Bokh' },
    { label: 'Diakhou', value: 'Diakhou' },
    { label: 'Kaba', value: 'Kaba' },
    { label: 'Keur ma Codou', value: 'Keur ma Codou' },
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
        commune: ['', Validators.required],
        quartier: ['', Validators.required],
        health_center: ['', Validators.required],
        status: ['unverified'],
        password: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', Validators.required],
        dataConsent: [false, Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }
  async ngOnInit() {
    try {
      const roles = await this.directusService.directus.request(readRoles());
      console.log('Roles from Directus:', roles);
      this.roles = roles.map((role: any) => ({
        label: role.name,
        value: role.id,
      }));
    } catch (error) {
      console.error('Error fetching roles from Directus:', error);
    }
    // Listen to region changes
    this.registerForm.get('region')?.valueChanges.subscribe((value) => {
      this.selectedRegion = this.regions.find((r) => r.value === value) || null;
      this.selectedCommune = null;
      this.registerForm.patchValue({ commune: '', quartier: '' });
    });

    // Listen to commune changes
    this.registerForm.get('commune')?.valueChanges.subscribe((value) => {
      if (this.selectedRegion) {
        this.selectedCommune = this.selectedRegion.communes.find((c) => c.value === value) || null;
        this.registerForm.patchValue({ quartier: '' });
      }
    });
  }
  getCommunes(): Commune[] {
    return this.selectedRegion ? this.selectedRegion.communes : [];
  }

  getQuartiers(): Quartier[] {
    return this.selectedCommune ? this.selectedCommune.quartiers : [];
  }

  async onRegister() {
    if (this.registerForm.valid) {
      console.log('Form Values:', this.registerForm.value);
      const formValues = this.registerForm.value;
      delete formValues.confirmPassword;
      delete formValues.dataConsent;
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
            this.router.navigate(['/authentication/verify-account'], {
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

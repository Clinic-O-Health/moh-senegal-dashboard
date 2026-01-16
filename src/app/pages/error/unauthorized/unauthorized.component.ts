import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-unauthorized',
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnauthorizedComponent {
  constructor(private readonly router: Router, private readonly authService: AuthService) {}
  goToDashboard() {
    this.router.navigate(['/admin']);
  }

  logout() {
    this.authService.logout();
  }
}

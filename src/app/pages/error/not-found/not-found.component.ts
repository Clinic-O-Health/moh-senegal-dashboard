import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-not-found',
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
  constructor(private readonly router: Router, private readonly authService: AuthService) {}
  goToDashboard() {
    this.router.navigate(['/admin']);
  }

  logout() {
    this.authService.logout();
  }
}

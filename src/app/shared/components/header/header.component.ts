import { ChangeDetectionStrategy, Component, EventEmitter, input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
@Component({
  selector: 'app-header',
  imports: [CommonModule, ButtonModule, AvatarModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  user = input<any>(null);

  @Output() toggleSidebar = new EventEmitter<void>();
}

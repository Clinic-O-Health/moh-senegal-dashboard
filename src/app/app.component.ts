import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(private readonly primengConfig: PrimeNG){}
  protected readonly title = signal('moh-dashboard-sn');
  ngOnInit(): void {
    this.primengConfig.ripple.set(true);
  }
}

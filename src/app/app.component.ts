import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  providers: [MessageService]
})
export class AppComponent {
  title = 'traffic-lights';
}

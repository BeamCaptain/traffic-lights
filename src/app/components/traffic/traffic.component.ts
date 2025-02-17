import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import {DatePipe, NgClass, NgForOf} from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import {Card} from 'primeng/card';
import {DatePicker} from 'primeng/datepicker';
import {Toast} from 'primeng/toast';
import {interval} from 'rxjs';

interface Phase {
  aRed: boolean;
  aYellow: boolean;
  aGreen: boolean;
  bRed: boolean;
  bYellow: boolean;
  bGreen: boolean;
  duration: number;
}

type Severity = 'success' | 'warn' | 'danger' | undefined;

@Component({
  selector: 'app-traffic',
  standalone: true,
  imports: [
    FormsModule,
    PanelModule,
    ButtonModule,
    NgClass,
    DatePipe,
    CalendarModule,
    TagModule,
    Card,
    DatePicker,
    Toast,
    NgForOf
  ],
  templateUrl: './traffic.component.html',
  styleUrl: './traffic.component.scss'
})
export class TrafficComponent implements OnInit, OnDestroy {
  currentTime: Date = new Date();
  trafficSystemOn = true;
  maintenanceMode = false;
  systemError = false;
  blinkOn = false;
  currentPhaseIndex = 0;
  phaseElapsed = 0;

  phases = [
    { aRed: true, aYellow: false, aGreen: false, bRed: true, bYellow: false, bGreen: false, duration: 20 },
    { aRed: true, aYellow: true, aGreen: false, bRed: true, bYellow: false, bGreen: false, duration: 5 },
    { aRed: false, aYellow: false, aGreen: true, bRed: true, bYellow: false, bGreen: false, duration: 100 },
    { aRed: false, aYellow: true, aGreen: false, bRed: true, bYellow: false, bGreen: false, duration: 10 },
    { aRed: true, aYellow: false, aGreen: false, bRed: true, bYellow: false, bGreen: false, duration: 10 },
    { aRed: true, aYellow: false, aGreen: false, bRed: true, bYellow: false, bGreen: false, duration: 10 },
    { aRed: true, aYellow: false, aGreen: false, bRed: true, bYellow: true, bGreen: false, duration: 5 },
    { aRed: true, aYellow: false, aGreen: false, bRed: false, bYellow: false, bGreen: true, duration: 100 },
    { aRed: true, aYellow: false, aGreen: false, bRed: false, bYellow: true, bGreen: false, duration: 10 },
  ];

  // Lamp states
  private aRedActive = false;
  private aYellowActive = false;
  private aGreenActive = false;
  private bRedActive = false;
  private bYellowActive = false;
  private bGreenActive = false;

  private simulationInterval: any;

  ngOnInit(): void {
    this.startSimulation();

    interval(1000).subscribe(() => {
      const date = this.currentTime;
      date.setSeconds(date.getSeconds() + 1);
      this.currentTime = date;
    });

  }

  ngOnDestroy(): void {
    this.stopSimulation();
  }

  private startSimulation(): void {
    this.simulationInterval = setInterval(() => {
      this.blinkOn = !this.blinkOn;
      if (this.trafficSystemOn) {
        this.updatePhases();
      }
      this.updateLamps();
    }, 500);
  }

  private stopSimulation(): void {
    clearInterval(this.simulationInterval);
  }

  private updatePhases(): void {
    if(this.maintenanceMode || this.systemError) {
      return
    }

    const hour = this.currentTime.getHours();
    this.maintenanceMode = (hour >= 20 || hour < 6);


    this.phaseElapsed++;
    const phase = this.phases[this.currentPhaseIndex];

    if (this.phaseElapsed >= phase.duration) {
      this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length;
      this.phaseElapsed = 0;
    }
  }

  private updateLamps(): void {
    if (!this.trafficSystemOn) {
      this.setAllOff();
      return;
    }

    if (this.systemError) {
      this.handleError();
      return;
    }

    if (this.maintenanceMode) {
      this.handleMaintenance();
      return;
    }

    this.setPhaseLights();
  }

  private handleError(): void {
    this.setAllOff();
    if (this.blinkOn) {
      this.aRedActive = true;
      this.bRedActive = true;
    }
  }

  private handleMaintenance(): void {
    this.setAllOff();
    if (this.blinkOn) {
      this.aYellowActive = true;
      this.bYellowActive = true;
    }
  }

  private setPhaseLights(): void {
    const phase = this.phases[this.currentPhaseIndex];
    this.aRedActive = phase.aRed;
    this.aYellowActive = phase.aYellow;
    this.aGreenActive = phase.aGreen;
    this.bRedActive = phase.bRed;
    this.bYellowActive = phase.bYellow;
    this.bGreenActive = phase.bGreen;
  }

  private setAllOff(): void {
    this.aRedActive = false;
    this.aYellowActive = false;
    this.aGreenActive = false;
    this.bRedActive = false;
    this.bYellowActive = false;
    this.bGreenActive = false;
  }

  // Public methods
  toggleTrafficSystem(): void {
    this.trafficSystemOn = !this.trafficSystemOn;
    if (this.trafficSystemOn) {
      this.currentPhaseIndex = 0;
      this.phaseElapsed = 0;
    }
  }

  simulateSystemError(): void {
    this.systemError = !this.systemError;
    this.maintenanceMode = false;
  }

  toggleMaintenanceMode(): void {
    this.maintenanceMode = !this.maintenanceMode;
    this.systemError = false;
  }

  onTimeChange(event: Date): void {
    this.currentTime = event;

    const hour = this.currentTime.getHours();
    this.maintenanceMode = (hour >= 20 || hour < 6);

  }

  getStatusSeverity(): Severity {
    if (this.systemError) return 'danger';
    if (this.maintenanceMode) return 'warn';
    return this.trafficSystemOn ? 'success' : undefined;
  }

  getStatusText(): string {
    if (this.systemError) return 'Systemfehler';
    if (this.maintenanceMode) return 'Wartungsmodus';
    return this.trafficSystemOn ? 'Normalbetrieb' : 'Ausgeschaltet';
  }

  getLightState(direction: string, color: "red" | "yellow" | "green"): boolean {
    const isGroupA = direction === 'north' || direction === 'south';

    switch(color) {
      case 'red': return isGroupA ? this.aRedActive : this.bRedActive;
      case 'yellow': return isGroupA ? this.aYellowActive : this.bYellowActive;
      case 'green': return isGroupA ? this.aGreenActive : this.bGreenActive;
    }
  }

  getStatusIcon(): string {
    if (this.systemError) return 'pi pi-exclamation-triangle';
    if (this.maintenanceMode) return 'pi pi-cog';
    return 'pi pi-check';
  }

}

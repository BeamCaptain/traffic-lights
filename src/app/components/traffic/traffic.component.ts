import {Component} from '@angular/core';
import {ButtonModule} from 'primeng/button';
import {FormsModule} from '@angular/forms';
import {PanelModule} from 'primeng/panel';
import {DatePipe, NgClass, NgIf} from '@angular/common';
import {DatePicker} from 'primeng/datepicker';


interface TrafficPhase {
  name: string;
  duration: number; // in Sekunden
  lightA: string;
  lightB: string;
}

@Component({
  selector: 'app-traffic',
  imports: [
    FormsModule,
    PanelModule,
    ButtonModule,
    NgClass,
    DatePipe,
    NgIf,
    DatePicker
  ],
  templateUrl: './traffic.component.html',
  standalone: true,
  styleUrl: './traffic.component.scss'
})
export class TrafficComponent {

// Manuell einstellbare Uhrzeit
  currentTime: Date = new Date();

  // Ampelzustände für Fahrtrichtung A und B
  lightA: string = 'red';
  lightB: string = 'green';

  // Zeiten (in Sekunden) für die einzelnen Phasen
  greenTime: number = 10;
  yellowTime: number = 3;
  redTime: number = 10;

  // Steuerung der Simulation
  trafficSystemOn: boolean = false;
  maintenanceMode: boolean = false;
  systemError: boolean = false;

  // Flag, ob der Wartungsmodus manuell umgeschaltet wurde
  manualMaintenance: boolean = false;

  // Intern: Zustandsmaschine
  phases: TrafficPhase[] = [];
  currentPhaseIndex: number = 0;
  phaseTimer: number = 0; // verstrichene Sekunden in der aktuellen Phase
  simulationInterval: any;

  ngOnInit() {
    // this.initializePhases();
    // Simulations-Tick (jede Sekunde)
    this.simulationInterval = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy() {
    clearInterval(this.simulationInterval);
  }

  // Initialisiert die Phasen basierend auf den aktuellen Zeitwerten
  initializePhases() {
    // Zyklus:
    // Phase 1: Fahrtrichtung A grün, B rot
    // Phase 2: Fahrtrichtung A gelb, B rot
    // Phase 3: Fahrtrichtung A rot, B grün
    // Phase 4: Fahrtrichtung A rot, B gelb
    this.phases = [
      { name: 'Phase 1', duration: this.greenTime, lightA: 'green', lightB: 'red' },
      { name: 'Phase 2', duration: this.yellowTime, lightA: 'yellow', lightB: 'red' },
      { name: 'Phase 3', duration: this.redTime, lightA: 'red', lightB: 'green' },
      { name: 'Phase 4', duration: this.yellowTime, lightA: 'red', lightB: 'yellow' }
    ];
    this.currentPhaseIndex = 0;
    this.phaseTimer = 0;
    this.applyPhase();
  }

  // Wird jede Sekunde aufgerufen
  tick() {
    // Automatische Aktivierung des Wartungsmodus von 20:00 bis 06:00,
    // sofern kein manueller Override erfolgt ist.
    const hour = this.currentTime.getHours();
    if (hour >= 20 || hour < 6) {
      this.maintenanceMode = true;
    } else if (!this.manualMaintenance) {
      this.maintenanceMode = false;
    }

    // Bei abgeschalteter Anlage, Wartungsmodus oder Systemfehlern keine Phasenschaltung:
    if (!this.trafficSystemOn || this.maintenanceMode || this.systemError) {
      // Anzeige – hier werden die Leuchten ausgeschaltet (alternativ z.B. blinkend darstellen)
      this.lightA = 'off';
      this.lightB = 'off';
      return;
    }

    // Simulation der Phasen
    this.phaseTimer++;
    const currentPhase = this.phases[this.currentPhaseIndex];
    if (this.phaseTimer >= currentPhase.duration) {
      // Nächste Phase
      this.phaseTimer = 0;
      this.currentPhaseIndex = (this.currentPhaseIndex + 1) % this.phases.length;
      this.applyPhase();
    }
  }

  // Setzt die Ampelzustände gemäß der aktuellen Phase
  applyPhase() {
    const phase = this.phases[this.currentPhaseIndex];
    this.lightA = phase.lightA;
    this.lightB = phase.lightB;
  }

  // Umschalten der Ampelanlage EIN/AUS
  toggleTrafficSystem() {
    this.trafficSystemOn = !this.trafficSystemOn;
    if (this.trafficSystemOn) {
      this.initializePhases();
    } else {
      this.lightA = 'off';
      this.lightB = 'off';
    }
  }

  // Manuelles Umschalten des Wartungsmodus
  toggleMaintenanceMode() {
    this.manualMaintenance = !this.manualMaintenance;
    this.maintenanceMode = this.manualMaintenance;
  }

  // Simulation eines Systemfehlers
  simulateSystemError() {
    this.systemError = !this.systemError;
  }

  // Bei Änderung der Timings werden die Phasen neu initialisiert
  updateTimings() {
    this.initializePhases();
  }

  // Beim manuellen Einstellen der Zeit via p-calendar
  onTimeChange(event: any) {
    this.currentTime = event;
  }
}

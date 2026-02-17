import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { SomaticService } from '../../services/somatic.service';
import { SomaticEntry } from '../../somatic.model';

@Component({
  selector: 'app-tracker',
  templateUrl: './tracker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackerComponent {
  private somaticService = inject(SomaticService);

  // Form state signals
  hrv = signal('');
  ghostLevel = signal(0);
  cortisolLevel = signal('');
  sleepQuality = signal(5);
  sleepNotes = signal('');

  // Data history signal
  somaticHistory = this.somaticService.entries;

  getTodayString(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  updateGhostLevel(event: Event) {
    this.ghostLevel.set(Number((event.target as HTMLInputElement).value));
  }
  
  updateSleepQuality(event: Event) {
    this.sleepQuality.set(Number((event.target as HTMLInputElement).value));
  }

  updateSignal(signal: any, event: Event) {
    signal.set((event.target as HTMLInputElement | HTMLTextAreaElement).value);
  }

  saveSomaticState() {
    const entry: SomaticEntry = {
        date: this.getTodayString(),
        hrv: this.hrv() ? Number(this.hrv()) : undefined,
        cortisol: this.cortisolLevel() ? Number(this.cortisolLevel()) : undefined,
        affectiveShadow: this.ghostLevel(),
        sleepQuality: this.sleepQuality(),
        sleepNotes: this.sleepNotes()
    };
    
    this.somaticService.addEntry(entry);
    alert('Dados somáticos e de sono registados para análise de deriva.');
    this.resetForm();
  }

  resetForm() {
    this.hrv.set('');
    this.ghostLevel.set(0);
    this.cortisolLevel.set('');
    this.sleepQuality.set(5);
    this.sleepNotes.set('');
  }
}
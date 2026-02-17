import { Injectable, signal } from '@angular/core';
import { SomaticEntry } from '../somatic.model';

@Injectable({ providedIn: 'root' })
export class SomaticService {
  private readonly STORAGE_KEY = 'mac_somatic_data';
  
  entries = signal<SomaticEntry[]>(this.loadFromStorage());

  addEntry(entry: SomaticEntry) {
    this.entries.update(currentEntries => {
        const newEntries = [...currentEntries.filter(e => e.date !== entry.date), entry]
            .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.saveToStorage(newEntries);
        return newEntries;
    });
  }
  
  private saveToStorage(entries: SomaticEntry[]) {
    try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
        console.error('Error saving somatic data to localStorage', e);
    }
  }

  private loadFromStorage(): SomaticEntry[] {
    try {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading somatic data from localStorage', e);
        return [];
    }
  }
}

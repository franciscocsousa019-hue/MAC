import { Injectable, signal } from '@angular/core';
import { Anchor } from '../anchor.model';

@Injectable({ providedIn: 'root' })
export class AnchorService {
  private readonly STORAGE_KEY = 'mac_anchor_data';
  private readonly initialAnchors: Anchor[] = [
    { date: '2022-03-20', title: 'Período de Stress Intenso', valence: 'negative', meta: { smell: 'Hospital/Limpeza', weather: 'Chuvoso', imageUrl: 'https://picsum.photos/seed/hospital/400/200' } },
    { date: '2023-10-10', title: 'Conquista de Grande Alívio', valence: 'positive', meta: { smell: 'Ar livre/Pinho', weather: 'Sol ameno' } }
  ];

  anchors = signal<Anchor[]>(this.loadFromStorage());

  constructor() {
    // If storage is empty, populate with initial data
    if (this.loadFromStorage().length === 0) {
        this.saveToStorage(this.initialAnchors);
        this.anchors.set(this.initialAnchors);
    }
  }

  addAnchor(anchor: Anchor) {
    this.anchors.update(currentAnchors => {
        const newAnchors = [...currentAnchors, anchor];
        this.saveToStorage(newAnchors);
        return newAnchors;
    });
  }

  private saveToStorage(anchors: Anchor[]) {
    try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(anchors));
    } catch (e) {
        console.error('Error saving anchors to localStorage', e);
    }
  }

  private loadFromStorage(): Anchor[] {
    try {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading anchors from localStorage', e);
        return [];
    }
  }
}
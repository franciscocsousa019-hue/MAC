import { Component, ChangeDetectionStrategy, inject, computed, AfterViewInit, ViewChild, ElementRef, effect } from '@angular/core';
import { AnchorService } from '../../services/anchor.service';
import { SomaticService } from '../../services/somatic.service';
import { Anchor } from '../../anchor.model';

interface UpcomingWindow extends Anchor {
    peakDate: string;
    diffDays: number;
}

// Declaring Chart.js type to avoid TypeScript errors for CDN-loaded library.
declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('mainChart') mainChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('affectiveLoadChart') affectiveLoadChartCanvas!: ElementRef<HTMLCanvasElement>;
  
  public Math = Math;
  private anchorService = inject(AnchorService);
  private somaticService = inject(SomaticService);

  private chart: any | null = null;
  private affectiveLoadChartInstance: any | null = null;

  upcomingWindows = computed<UpcomingWindow[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.anchorService.anchors()
      .map(anchor => {
        const anchorDate = new Date(anchor.date);
        const currentYearDate = new Date(today.getFullYear(), anchorDate.getMonth(), anchorDate.getDate());
        currentYearDate.setHours(0, 0, 0, 0);

        const diffTime = currentYearDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          ...anchor,
          diffDays,
          peakDate: currentYearDate.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
        };
      })
      .filter(item => Math.abs(item.diffDays) <= 30)
      .sort((a, b) => a.diffDays - b.diffDays);
  });

  isWindowActive = computed(() => {
    return this.upcomingWindows().some(w => w.valence === 'negative');
  });

  affectiveLoad = computed(() => {
    const months = Array(12).fill(0).map(() => ({ positive: 0, negative: 0 }));
    this.anchorService.anchors().forEach(anchor => {
        const monthIndex = new Date(anchor.date).getMonth();
        if (anchor.valence === 'positive') {
            months[monthIndex].positive++;
        } else {
            months[monthIndex].negative++;
        }
    });
    return months;
  });
  
  somaticChartData = computed(() => {
    const entries = this.somaticService.entries()
        .slice(0, 7)
        .reverse(); // last 7 days, in chronological order
    
    const labels = entries.map(e => new Date(e.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short'}));
    const hrvData = entries.map(e => e.hrv ?? null);
    const shadowData = entries.map(e => (e.affectiveShadow ?? 0) * 10); // Scale shadow to be visible

    return { labels, hrvData, shadowData };
  });

  constructor() {
    effect(() => {
      if (this.affectiveLoadChartCanvas) { 
          this.initAffectiveLoadChart();
      }
      if (this.mainChartCanvas) {
          this.initChart();
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
    this.initAffectiveLoadChart();
  }

  private initAffectiveLoadChart() {
    if (typeof Chart === 'undefined' || !this.affectiveLoadChartCanvas) return;

    const ctx = this.affectiveLoadChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.affectiveLoadChartInstance) {
        this.affectiveLoadChartInstance.destroy();
    }

    const data = this.affectiveLoad();
    
    this.affectiveLoadChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [
                {
                    label: 'Carga Negativa',
                    data: data.map(m => m.negative),
                    backgroundColor: 'rgba(239, 68, 68, 0.6)',
                },
                {
                    label: 'Carga Positiva',
                    data: data.map(m => m.positive),
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { stacked: true, ticks: { font: { family: 'Inter' } } },
                y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1, font: { family: 'Inter' } } }
            }
        }
    });
  }

  private initChart() {
    if (typeof Chart === 'undefined' || !this.mainChartCanvas) { return; }

    const ctx = this.mainChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }
    
    const chartData = this.somaticChartData();

    this.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels.length > 0 ? chartData.labels : ['Sem Dados'],
            datasets: [
                {
                    label: 'VFC (HRV)',
                    data: chartData.hrvData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Sombra Afetiva (0-100)',
                    data: chartData.shadowData,
                    borderColor: '#ef4444',
                    borderDash: [5, 5],
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { font: { family: 'Inter' } } },
                tooltip: { mode: 'index', intersect: false },
            },
            scales: {
                y: { beginAtZero: true, suggestedMax: 100 },
                x: { ticks: { font: { family: 'Inter' } } }
            }
        }
    });
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DetectorService, DomainResult, Technology } from '../../services/detector.service';

@Component({
  selector: 'app-detector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detector.component.html',
  styleUrl: './detector.component.scss'
})
export class DetectorComponent {
  // Input
  textInput = '';
  selectedFile: File | null = null;
  activeTab: 'text' | 'file' = 'text';

  // State
  loading = false;
  results: DomainResult[] = [];
  errorMsg = '';

  // Filtre
  filterStatus = 'all';
  searchTerm = '';
  expandedDomain: string | null = null;

  constructor(private detectorService: DetectorService) { }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  analyze(): void {
    this.loading = true;
    this.results = [];
    this.errorMsg = '';

    if (this.activeTab === 'text') {
      const domains = this.textInput
        .split('\n')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      if (domains.length === 0) {
        this.errorMsg = 'Adaugă cel puțin un domeniu!';
        this.loading = false;
        return;
      }

      if (domains.length === 1) {
        this.detectorService.analyzeSingle(domains[0]).subscribe({
          next: (result) => { this.results = [result]; this.loading = false; },
          error: (err) => { this.errorMsg = 'Eroare: ' + err.message; this.loading = false; }
        });
      } else {
        this.detectorService.analyzeBatch(domains).subscribe({
          next: (results) => { this.results = results; this.loading = false; },
          error: (err) => { this.errorMsg = 'Eroare: ' + err.message; this.loading = false; }
        });
      }
    } else {
      if (!this.selectedFile) {
        this.errorMsg = 'Selectează un fișier .txt!';
        this.loading = false;
        return;
      }
      this.detectorService.analyzeFile(this.selectedFile).subscribe({
        next: (results) => { this.results = results; this.loading = false; },
        error: (err) => { this.errorMsg = 'Eroare: ' + err.message; this.loading = false; }
      });
    }
  }

  toggleExpand(domain: string): void {
    this.expandedDomain = this.expandedDomain === domain ? null : domain;
  }

  get filteredResults(): DomainResult[] {
    return this.results.filter(r => {
      const matchStatus = this.filterStatus === 'all' || r.status === this.filterStatus;
      const matchSearch = r.domain.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }

  get successCount(): number { return this.results.filter(r => r.status === 'success').length; }
  get errorCount(): number { return this.results.filter(r => r.status === 'error').length; }
  get totalTechs(): number { return this.results.reduce((a, r) => a + r.technologies.length, 0); }

  

  exportJSON(): void {
    const blob = new Blob([JSON.stringify(this.results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'results.json'; a.click();
  }
}

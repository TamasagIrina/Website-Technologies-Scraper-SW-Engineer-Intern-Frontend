import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Technology {
  name: string;
  category: string;
  evidence: string;
  confidence: number;
}

export interface DomainResult {
  domain: string;
  status: string;
  errorMessage: string | null;
  technologies: Technology[];
}

@Injectable({
  providedIn: 'root'
})
export class DetectorService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  analyzeSingle(domain: string): Observable<DomainResult> {
    return this.http.get<DomainResult>(`${this.apiUrl}/analyze?domain=${domain}`);
  }

  analyzeBatch(domains: string[]): Observable<DomainResult[]> {
    return this.http.post<DomainResult[]>(`${this.apiUrl}/analyze/batch`, { domains });
  }

  analyzeFile(file: File): Observable<DomainResult[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<DomainResult[]>(`${this.apiUrl}/analyze/file`, formData);
  }
}

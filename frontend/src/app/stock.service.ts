import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StockService {
  constructor(private http: HttpClient) {}

  getStock(ticker: string): Observable<any> {
    return this.http.get<any>(`/api/stock/${ticker}`);
  }

  saveZakatCalculation(payload: { inputs: Record<string, unknown>; result: Record<string, unknown> }): Observable<any> {
    return this.http.post<any>(`/api/zakat`, payload);
  }

  getZakatHistory(email: string): Observable<{ items: any[] }> {
    return this.http.get<{ items: any[] }>(`/api/zakat/history?email=${encodeURIComponent(email)}`);
  }
}

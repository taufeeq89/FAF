import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ZakatRecordStateService {
  private currentEditingRecord: any | null = null;
  private readonly editingRecordSubject = new BehaviorSubject<any | null>(null);
  editingRecord$ = this.editingRecordSubject.asObservable();

  setEditingRecord(record: any) {
    this.currentEditingRecord = record;
    this.editingRecordSubject.next(record);
  }

  getEditingRecord() {
    return this.currentEditingRecord;
  }

  consumeEditingRecord() {
    const record = this.currentEditingRecord;
    this.clearEditingRecord();
    return record;
  }

  clearEditingRecord() {
    this.currentEditingRecord = null;
    this.editingRecordSubject.next(null);
  }
}
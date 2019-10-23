import { TestBed } from '@angular/core/testing';

import { LiffBleService } from './liff-ble.service';

describe('LiffBleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LiffBleService = TestBed.get(LiffBleService);
    expect(service).toBeTruthy();
  });
});

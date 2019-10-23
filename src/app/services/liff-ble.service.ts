import { Injectable } from '@angular/core';
import { GattData } from '../data/gattData';

declare var liff: any;

@Injectable({
  providedIn: 'root'
})
export class LiffBleService {

  constructor() { }

  initLineLiff() {
    return new Promise((res, reject) => {
      liff.init(() => {
        alert('Success');
        res(this.initPluginBluetooth());
      }, (err) => {
        alert('error');
        reject(err);
      });
    });
  }

  initPluginBluetooth() {
    return new Promise((res, reject) => {
      liff.initPlugins(['bluetooth'], () => {
        alert('Success');
        res(this.liffCheckAvailablityAndDo());
      }, err => {
        alert('Error');
        reject(err);
      });
    });
  }

  liffCheckAvailablityAndDo() {
    return new Promise((res, reject) => {
      liff.bluetooth.getAvailability((data) => {
        res(data);
      }, (err) => {
        reject(err);
      });
    });
  }

  liffRequestDevice() {
    return new Promise((res, reject) => {
      liff.bluetooth.requestDevice((data) => {
        res(data);
      });
    });
  }

  connectToDevice(device) {
    alert('connectToDevice');
    return new Promise((res, reject) => {
      device.gatt.connect((data) => {
        res(data);
      });
    });
  }

  fetchPrimaryService(device) {
    alert('fetchPrimaryService');
    return new Promise((res, reject) => {
      device.gatt.getPrimaryService(GattData.USER_SERVICE_UUID, (service) => {
        res(service);
      });
    });
  }

  fetchCharacteristic(service, characteristicUuid) {
    alert('fetchCharacteristic');
    return new Promise((res, reject) => {
      service.getCharacteristic(characteristicUuid, (characteristic) => {
        res(characteristic);
      });
    });
  }

  startBleNotification(characteristic) {
    alert('startBleNotification');
    return new Promise((res, reject) => {
      characteristic.startNotifications(() => {
        res();
      });
    });
  }

  startEventListener(characteristic) {
    alert('startEventListener');
    return new Promise((res, reject) => {
      characteristic.addEventListener('characteristicvaluechanged', e => {
        const dv = e.target.value;
        res(dv);
      });
    });
  }
 }

import { Component, OnInit } from '@angular/core';
import { GattData } from '../data/gattData';
import { LiffBleService } from '../services/liff-ble.service';

declare var liff: any;
const SERVICE_UUID = GattData.USER_SERVICE_UUID;
const BTN_CHARACTERISTIC_UUID = GattData.BTN_CHARACTERISTIC_UUID;
const ULTRA_DATA0_CHARACTERISTIC_UUID =
GattData.ULTRA_DATA0_CHARACTERISTIC_UUID;
const ULTRA_DATA1_CHARACTERISTIC_UUID =
GattData.ULTRA_DATA1_CHARACTERISTIC_UUID;
// const PSDI_SERVICE_UUID = GattData.PSDI_SERVICE_UUID;
// const PSDI_CHARACTERISTIC_UUID = GattData.PSDI_CHARACTERISTIC_UUID;


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  messages: string;
  // userProfile: any;
  // statusBle: boolean;
  service: any;
  characteristic: any;
  bufferData0 = new ArrayBuffer(512);
  bufferData1 = new ArrayBuffer(512);
  dvData0 = new DataView(this.bufferData0);
  dvData1 = new DataView(this.bufferData1);

  ultraData0: any;
  ultraData1: any;
  bufferRawChannel1 = new ArrayBuffer(256);
  bufferRawChannel2 = new ArrayBuffer(256);
  bufferRawChannel3 = new ArrayBuffer(256);
  bufferRawChannel4 = new ArrayBuffer(256);

  dvRawChannel1 = new DataView(this.bufferRawChannel1);
  dvRawChannel2 = new DataView(this.bufferRawChannel2);
  dvRawChannel3 = new DataView(this.bufferRawChannel3);
  dvRawChannel4 = new DataView(this.bufferRawChannel4);

  ch1AntePosition: number;
  ch1PostePosition: number;
  ch2AntePosition: number;
  ch2PostePosition: number;
  ch3AntePosition: number;
  ch3PostePosition: number;
  ch4AntePosition: number;
  ch4PostePosition: number;

  ch1BladderSize: number;
  ch2BladderSize: number;
  ch3BladderSize: number;
  ch4BladderSize: number;

  ch1IsUrine: boolean;
  ch2IsUrine: boolean;
  ch3IsUrine: boolean;
  ch4IsUrine: boolean;

  ch1Under20FrontPosition: number;
  ch1Under20BackPosition: number;
  ch2Under20FrontPosition: number;
  ch2Under20BackPosition: number;
  ch3Under20FrontPosition: number;
  ch3Under20BackPosition: number;
  ch4Under20FrontPosition: number;
  ch4Under20BackPosition: number;

  constructor(private lineService: LiffBleService) {
    this.messages = '';
    // this.statusBle = true;
    this.ch1AntePosition = 0;
    this.ch1PostePosition = 0;
    this.ch2AntePosition = 0;
    this.ch2PostePosition = 0;
    this.ch3AntePosition = 0;
    this.ch3PostePosition = 0;
    this.ch4AntePosition = 0;
    this.ch4PostePosition = 0;

    this.ch1Under20FrontPosition = 0;
    this.ch1Under20BackPosition = 0;
    this.ch2Under20FrontPosition = 0;
    this.ch2Under20BackPosition = 0;
    this.ch3Under20FrontPosition = 0;
    this.ch3Under20BackPosition = 0;
    this.ch4Under20FrontPosition = 0;
    this.ch4Under20BackPosition = 0;
  }

  ngOnInit() {
    liff.init(
      () => this.initLineLiff(),
      error => alert('INIT ERROR: ' + JSON.stringify(error))
    );
  }

  initLineLiff() {
    liff.initPlugins(['bluetooth']).then(() => {
      this.liffCheckAvailablityAndDo(() => this.liffRequestDevice());
    });
  }

  liffCheckAvailablityAndDo(callbackIfAvailable) {
    liff.bluetooth.getAvailability().then(isAvailable => {
      if (isAvailable) {
        callbackIfAvailable();
      } else {
        setTimeout(
          () => this.liffCheckAvailablityAndDo(callbackIfAvailable),
          10000
        );
      }
    });
  }

  liffRequestDevice() {
    liff.bluetooth.requestDevice().then(device => {
      this.liffConnectToDevice(device);
    });
  }

  liffConnectToDevice(device) {
    device.gatt.connect().then(() => {
      device.gatt.getPrimaryService(SERVICE_UUID).then(service => {
        this.service = service;
        // Buttonのcharacteristicを取得します。
        service.getCharacteristic(BTN_CHARACTERISTIC_UUID).then((characteristicButton) => {
          characteristicButton.startNotifications().then(() => {
            characteristicButton.addEventListener('characteristicvaluechanged', e => {
              const buff = (new Uint16Array(e.target.value.buffer));
              alert(buff);
            });
          });
        });
        service.getCharacteristic(ULTRA_DATA0_CHARACTERISTIC_UUID).then((characteristicData0) => {
          characteristicData0.startNotifications().then(() => {
            characteristicData0.addEventListener('characteristicvaluechanged', e => {
              const buffData0 = (new Uint16Array(e.target.value.buffer));
            });
          });
        });
      });
      // device.gatt.getPrimaryService(PSDI_SERVICE_UUID).then(service => {
      //   this.liffGetPSDIService(service);
      // });
    });

    const disconnectCallback = () => {
      device.removeEventListener('gattserverdisconnected', disconnectCallback);
      this.initLineLiff();
    };
    device.addEventListener('gattserverdisconnected', disconnectCallback);
  }


  liffGetUltraDataService(service) {
    this.ch1IsUrine = false;
    this.ch2IsUrine = false;
    this.ch3IsUrine = false;
    this.ch4IsUrine = false;
    service.getCharacteristic(ULTRA_DATA0_CHARACTERISTIC_UUID).then(characteristicData0 => {
        return characteristicData0.readValue();
      })
      .then(dataView0Value => {
        service.getCharacteristic(ULTRA_DATA1_CHARACTERISTIC_UUID).then(characteristicData1 => {
            return characteristicData1.readValue();
          })
          .then(dataView1Value => {
            for (let i = 0; i < dataView0Value.byteLength; i = i + 2) {
              this.dvData0.setUint16(i, dataView0Value.getUint16(i));
            }
            for (let i = 0; i < dataView1Value.byteLength; i = i + 2) {
              this.dvData1.setUint16(i, dataView1Value.getUint16(i));
            }
            this.splitForChannel(this.dvData0, this.dvData1);
            this.ultraData0 = new Uint16Array(this.dvData0.buffer);
            this.ultraData1 = new Uint16Array(this.dvData1.buffer);
          })
          .catch(error => alert('ERROR Data0: ' + error));
      })
      .catch(error => alert('ERROR Data1: '  + error));
  }

  splitForChannel(dvData0, dvData1) {
    for (let i = 0; i < dvData0.byteLength; i = i + 2) {
      if (i < 256) {
        this.dvRawChannel1.setUint16(i, dvData0.getUint16(i, true));
      } else if (i < 512) {
        this.dvRawChannel2.setUint16(i - 256, dvData0.getUint16(i, true));
      }
    }
    for (let i = 0; i < dvData1.byteLength; i = i + 2) {
      if (i < 256) {
        this.dvRawChannel3.setUint16(i, dvData1.getUint16(i, true));
      } else if (i < 512) {
        this.dvRawChannel4.setUint16(i - 256, dvData1.getUint16(i, true));
      }
    }
    this.culcDiscardUnder100(this.dvRawChannel1, this.dvRawChannel2, this.dvRawChannel3, this.dvRawChannel4);
  }
  culcDiscardUnder100(dvRawChannel1, dvRawChannel2, dvRawChannel3, dvRawChannel4) {
    const bufferChannel1DiscardUnder100 = new ArrayBuffer(256);
    const bufferChannel2DiscardUnder100 = new ArrayBuffer(256);
    const bufferChannel3DiscardUnder100 = new ArrayBuffer(256);
    const bufferChannel4DiscardUnder100 = new ArrayBuffer(256);
    const dvChannel1DiscardUnder100 = new DataView(bufferChannel1DiscardUnder100);
    const dvChannel2DiscardUnder100 = new DataView(bufferChannel2DiscardUnder100);
    const dvChannel3DiscardUnder100 = new DataView(bufferChannel3DiscardUnder100);
    const dvChannel4DiscardUnder100 = new DataView(bufferChannel4DiscardUnder100);

    for (let ch1Posi = 0; ch1Posi < dvRawChannel1.byteLength; ch1Posi = ch1Posi + 2) {
      if (dvRawChannel1.getUint16(ch1Posi) < 100) {
        dvChannel1DiscardUnder100.setUint16(ch1Posi, 0);
      } else if (dvRawChannel1.getUint16(ch1Posi) >= 100) {
        dvChannel1DiscardUnder100.setUint16(ch1Posi, dvRawChannel1.getUint16(ch1Posi));
      }
    }
    for (let ch2Posi = 0; ch2Posi < dvRawChannel2.byteLength; ch2Posi = ch2Posi + 2) {
      if (dvRawChannel2.getUint16(ch2Posi) < 100) {
        dvChannel2DiscardUnder100.setUint16(ch2Posi, 0);
      } else if (dvRawChannel2.getUint16(ch2Posi) >= 100) {
        dvChannel2DiscardUnder100.setUint16(ch2Posi, dvRawChannel2.getUint16(ch2Posi));
      }
    }
    for (let ch3Posi = 0; ch3Posi < dvRawChannel3.byteLength; ch3Posi = ch3Posi + 2) {
      if (dvRawChannel3.getUint16(ch3Posi) < 100) {
        dvChannel3DiscardUnder100.setUint16(ch3Posi, 0);
      } else if (dvRawChannel3.getUint16(ch3Posi) >= 100) {
        dvChannel3DiscardUnder100.setUint16(ch3Posi, dvRawChannel3.getUint16(ch3Posi));
      }
    }
    for (let ch4Posi = 0; ch4Posi < dvRawChannel4.byteLength; ch4Posi = ch4Posi + 2) {
      if (dvRawChannel4.getUint16(ch4Posi) < 100) {
        dvChannel4DiscardUnder100.setUint16(ch4Posi, 0);
      } else if (dvRawChannel4.getUint16(ch4Posi) >= 100) {
        dvChannel4DiscardUnder100.setUint16(ch4Posi, dvRawChannel4.getUint16(ch4Posi));
      }
    }
    this.culcBladderRange(dvChannel1DiscardUnder100, dvChannel2DiscardUnder100, dvChannel3DiscardUnder100, dvChannel4DiscardUnder100);
  }

  culcBladderRange(dvChannel1, dvChannel2, dvChannel3, dvChannel4) {
    this.ch1AntePosition = 0;
    this.ch1PostePosition = 0;
    this.ch2AntePosition = 0;
    this.ch2PostePosition = 0;
    this.ch3AntePosition = 0;
    this.ch3PostePosition = 0;
    this.ch4AntePosition = 0;
    this.ch4PostePosition = 0;

    for (let ch1Posi = 0; ch1Posi < dvChannel1.byteLength; ch1Posi = ch1Posi + 2) {
      if (dvChannel1.getUint16(ch1Posi) === 0) {      // 入っているところが0のときにここに処理が遷移
        if (this.ch1AntePosition === 0) {
          this.ch1AntePosition = ch1Posi;
        } else if (this.ch1AntePosition !== 0) {            // 後壁の計算
          if (ch1Posi < 254) {
            this.ch1PostePosition = ch1Posi;
            if (dvChannel1.getUint16(ch1Posi + 2) !== 0) {
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    for (let ch2Posi = 0; ch2Posi < dvChannel2.byteLength; ch2Posi = ch2Posi + 2) {
      if (dvChannel2.getUint16(ch2Posi) === 0) {      // 入っているところが0のときにここに処理が遷移
        if (this.ch2AntePosition === 0) {
          this.ch2AntePosition = ch2Posi;
        } else if (this.ch2AntePosition !== 0) {            // 後壁の計算
          if (ch2Posi < 254) {
            this.ch2PostePosition = ch2Posi;
            if (dvChannel2.getUint16(ch2Posi + 2) !== 0) {
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    for (let ch3Posi = 0; ch3Posi < dvChannel3.byteLength; ch3Posi = ch3Posi + 2) {
      if (dvChannel3.getUint16(ch3Posi) === 0) {      // 入っているところが0のときにここに処理が遷移
        if (this.ch3AntePosition === 0) {
          this.ch3AntePosition = ch3Posi;
        } else if (this.ch3AntePosition !== 0) {            // 後壁の計算
          if (ch3Posi < 254) {
            this.ch3PostePosition = ch3Posi;
            if (dvChannel3.getUint16(ch3Posi + 2) !== 0) {
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    for (let ch4Posi = 0; ch4Posi < dvChannel4.byteLength; ch4Posi = ch4Posi + 2) {
      if (dvChannel4.getUint16(ch4Posi) === 0) {      // 入っているところが0のときにここに処理が遷移
        if (this.ch4AntePosition === 0) {
          this.ch4AntePosition = ch4Posi;
        } else if (this.ch4AntePosition !== 0) {      // 後壁の計算
          if (ch4Posi < 254) {
            this.ch4PostePosition = ch4Posi;
            if (dvChannel4.getUint16(ch4Posi + 2) !== 0) {
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    this.ch1BladderSize = (this.ch1PostePosition) - (this.ch1AntePosition);
    this.ch2BladderSize = (this.ch2PostePosition) - (this.ch2AntePosition);
    this.ch3BladderSize = (this.ch3PostePosition) - (this.ch3AntePosition);
    this.ch4BladderSize = (this.ch4PostePosition) - (this.ch4AntePosition);
    this.anteriorPositionUnder30(this.ch1AntePosition, this.ch2AntePosition, this.ch3AntePosition, this.ch4AntePosition);
  }

  sendMessageToChatRoom() {
    const packageId = '11537';

    let countIs = 0;
    if (this.ch1IsUrine) {
      countIs++;
    }
    if (this.ch2IsUrine) {
      countIs++;
    }
    if (this.ch3IsUrine) {
      countIs++;
    }
    if (this.ch4IsUrine) {
      countIs++;
    }
    const strCountIs = String(countIs);
    // const kindMessageArray = [
    //   {
    //     type : 'text',
    //     text : `${strCountIs}つのデータから取得できております。`
    //   }
    // ];

    // liff.sendMessages(kindMessageArray).then((res) => alert('Success!')).catch((err) => alert(err));
  }

  anteriorPositionUnder30(ch1AntePosition, ch2AntePosition, ch3AntePosition, ch4AntePosition) {
    if ((ch1AntePosition <= 30) || (ch2AntePosition <= 30) || (ch3AntePosition <= 30) || (ch4AntePosition <= 30)) {
      if ((this.ch1BladderSize > 9) || (this.ch2BladderSize > 9) || (this.ch3BladderSize > 9) || (this.ch4BladderSize > 9)) {
        this.culcDiscardUnder20();
      }
    }
    // this.sendMessageToChatRoom();
  }

  culcDiscardUnder20() {
    const bufferChannel1DiscardUnder20 = new ArrayBuffer(256);
    const dvChannel1DiscardUnder20 = new DataView(bufferChannel1DiscardUnder20);
    const bufferChannel2DiscardUnder20 = new ArrayBuffer(256);
    const dvChannel2DiscardUnder20 = new DataView(bufferChannel2DiscardUnder20);
    const bufferChannel3DiscardUnder20 = new ArrayBuffer(256);
    const dvChannel3DiscardUnder20 = new DataView(bufferChannel3DiscardUnder20);
    const bufferChannel4DiscardUnder20 = new ArrayBuffer(256);
    const dvChannel4DiscardUnder20 = new DataView(bufferChannel4DiscardUnder20);


    for (let ch1Posi = 0; ch1Posi < this.dvRawChannel1.byteLength; ch1Posi = ch1Posi + 2) {
      if (this.dvRawChannel1.getUint16(ch1Posi) < 20) {
        dvChannel1DiscardUnder20.setUint16(ch1Posi, 0);
      } else if (this.dvRawChannel1.getUint16(ch1Posi) >= 20) {
        dvChannel1DiscardUnder20.setUint16(ch1Posi, this.dvRawChannel1.getUint16(ch1Posi));
      }
    }
    for (let ch2Posi = 0; ch2Posi < this.dvRawChannel2.byteLength; ch2Posi = ch2Posi + 2) {
      if (this.dvRawChannel2.getUint16(ch2Posi) < 20) {
        dvChannel2DiscardUnder20.setUint16(ch2Posi, 0);
      } else if (this.dvRawChannel2.getUint16(ch2Posi) >= 20) {
        dvChannel2DiscardUnder20.setUint16(ch2Posi, this.dvRawChannel2.getUint16(ch2Posi));
      }
    }
    for (let ch3Posi = 0; ch3Posi < this.dvRawChannel3.byteLength; ch3Posi = ch3Posi + 2) {
      if (this.dvRawChannel3.getUint16(ch3Posi) < 20) {
        dvChannel3DiscardUnder20.setUint16(ch3Posi, 0);
      } else if (this.dvRawChannel3.getUint16(ch3Posi) >= 20) {
        dvChannel3DiscardUnder20.setUint16(ch3Posi, this.dvRawChannel3.getUint16(ch3Posi));
      }
    }
    for (let ch4Posi = 0; ch4Posi < this.dvRawChannel4.byteLength; ch4Posi = ch4Posi + 2) {
      if (this.dvRawChannel4.getUint16(ch4Posi) < 20) {
        dvChannel4DiscardUnder20.setUint16(ch4Posi, 0);
      } else if (this.dvRawChannel4.getUint16(ch4Posi) >= 20) {
        dvChannel4DiscardUnder20.setUint16(ch4Posi, this.dvRawChannel4.getUint16(ch4Posi));
      }
    }
    this.culcDiscardPosition(dvChannel1DiscardUnder20, dvChannel2DiscardUnder20, dvChannel3DiscardUnder20, dvChannel4DiscardUnder20);
    this.judgeRangePosition();
  }

  culcDiscardPosition(dvChannel1, dvChannel2, dvChannel3, dvChannel4) {
    this.ch1Under20FrontPosition = 0;
    this.ch1Under20BackPosition = 0;
    this.ch2Under20FrontPosition = 0;
    this.ch2Under20BackPosition = 0;
    this.ch3Under20FrontPosition = 0;
    this.ch3Under20BackPosition = 0;
    this.ch4Under20FrontPosition = 0;
    this.ch4Under20BackPosition = 0;

    for (let ch1Posi = 0; ch1Posi < dvChannel1.byteLength; ch1Posi = ch1Posi + 2) {
      if (dvChannel1.getUint16(ch1Posi) === 0) {
        if (this.ch1Under20FrontPosition === 0) {
          this.ch1Under20FrontPosition = ch1Posi;
        } else if (this.ch1Under20FrontPosition !== 0) {
          if (ch1Posi < 254) {
            this.ch1Under20BackPosition = ch1Posi;
            if (dvChannel1.getUint16(ch1Posi + 2) !== 0) {
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    for (let ch2Posi = 0; ch2Posi < dvChannel2.byteLength; ch2Posi = ch2Posi + 2) {
      if (dvChannel2.getUint16(ch2Posi) === 0) {
        if (this.ch2Under20FrontPosition === 0) {
          this.ch2Under20FrontPosition = ch2Posi;
        } else if (this.ch2Under20FrontPosition !== 0) {
          if (ch2Posi < 254) {
            this.ch2Under20BackPosition = ch2Posi;
            if (dvChannel2.getUint16(ch2Posi + 2) !== 0) {
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    for (let ch3Posi = 0; ch3Posi < dvChannel3.byteLength; ch3Posi = ch3Posi + 2) {
      if (dvChannel3.getUint16(ch3Posi) === 0) {
        if (this.ch3Under20FrontPosition === 0) {
          this.ch3Under20FrontPosition = ch3Posi;
        } else if (this.ch3Under20FrontPosition !== 0) {
          if (ch3Posi < 254) {
            this.ch3Under20BackPosition = ch3Posi;
            if (dvChannel3.getUint16(ch3Posi + 2) !== 0) {
              break;
            }
          } else {
            break;
          }
        }
      }
    }

    for (let ch4Posi = 0; ch4Posi < dvChannel4.byteLength; ch4Posi = ch4Posi + 2) {
      if (dvChannel4.getUint16(ch4Posi) === 0) {
        if (this.ch4Under20FrontPosition === 0) {
          this.ch4Under20FrontPosition = ch4Posi;
        } else if (this.ch4Under20FrontPosition !== 0) {
          if (ch4Posi < 254) {
            this.ch4Under20BackPosition = ch4Posi;
            if (dvChannel4.getUint16(ch4Posi + 2) !== 0) {
              break;
            }
          } else {
            break;
          }
        }
      }
    }
  }

  judgeRangePosition() {
    if (this.ch1AntePosition <= this.ch1Under20FrontPosition) {
      if (this.ch1Under20BackPosition <= this.ch1PostePosition) {
        if ((this.ch1Under20BackPosition - this.ch1Under20FrontPosition) > 3) {
          this.ch1IsUrine = true;
        } else {
          this.ch1IsUrine = false;
        }
      } else {
        this.ch1IsUrine = false;
      }
    } else {
      this.ch1IsUrine = false;
    }
    if (this.ch2AntePosition <= this.ch2Under20FrontPosition) {
      if (this.ch2Under20BackPosition <= this.ch2PostePosition) {
        if ((this.ch2Under20BackPosition - this.ch2Under20FrontPosition) > 3) {
          this.ch2IsUrine = true;
        } else {
          this.ch2IsUrine = false;
        }
      } else {
        this.ch2IsUrine = false;
      }
    } else {
      this.ch2IsUrine = false;
    }
    if (this.ch3AntePosition <= this.ch3Under20FrontPosition) {
      if (this.ch3Under20BackPosition <= this.ch3PostePosition) {
        if ((this.ch3Under20BackPosition - this.ch3Under20FrontPosition) > 3) {
          this.ch3IsUrine = true;
        } else {
          this.ch3IsUrine = false;
        }
      } else {
        this.ch3IsUrine = false;
      }
    } else {
      this.ch3IsUrine = false;
    }
    if (this.ch4AntePosition <= this.ch4Under20FrontPosition) {
      if (this.ch4Under20BackPosition <= this.ch4PostePosition) {
        if ((this.ch4Under20BackPosition - this.ch4Under20FrontPosition) > 3) {
          this.ch4IsUrine = true;
        } else {
          this.ch4IsUrine = false;
        }
      } else {
        this.ch4IsUrine = false;
      }
    } else {
      this.ch4IsUrine = false;
    }
  }

  // async liffGetPSDIService(service) {
  //   service.getCharacteristic(PSDI_CHARACTERISTIC_UUID).then(characteristic => {
  //     return characteristic.readValue();
  //   })
  //   .then(value => {
  //     const psdi = new Uint8Array(value.buffer);
  //   })
  //   .catch(error => alert('ERROR liffGetPSDIService : ' + error));
  // }

  fetchUltradata() {
    this.liffGetUltraDataService(this.service);
  }
}

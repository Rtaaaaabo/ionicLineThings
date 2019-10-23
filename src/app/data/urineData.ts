export let UrineData = {
    bufferdata: {
        data0: new ArrayBuffer(512),
        data1: new ArrayBuffer(512),
        channel1: new ArrayBuffer(256),
        Channel2: new ArrayBuffer(256),
        Channel3: new ArrayBuffer(256),
        Channel4: new ArrayBuffer(256)
    },

    dataview: {
        data0: new DataView(this.UrineData.bufferdata.data0),
        data1: new DataView(this.UrineData.bufferdata.data),
        channel1 : new DataView(this.UrineData.bufferdata.channel1),
        channel2 : new DataView(this.UrineData.bufferdata.channel2),
        channel3 : new DataView(this.UrineData.bufferdata.channel3),
        channel4 : new DataView(this.UrineData.bufferdata.channel4),
    },

    isUrine: {
        ch1: false,
        ch2: false,
        ch3: false,
        ch4: false
    },
};

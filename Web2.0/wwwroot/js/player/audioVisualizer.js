var delta = 23;
var max = 100;
var count = 0;
AudioVisualation = {
    vuCleaned: false,
    initSuccess: false,
    disabled: false,
    canvas: null,
    meter: null,
    meterChannels: [],
    audio: null,
    ctx2d: null,
    ctx: null,
    source: null,
    processor: null,
    compressor: null,
    analyser: null,
    channels: null,
    fft: null,
    frameBufferLength: null,
    currentPeak: 0,
    paused: false,
    options: {
        sampleLength: 4096,
        autoPlay: false,
        clearPeakInterval: 500,
        graphWaveInterval: 100,
        vuDisabled: false,
        drumDisabled: false,
        waveDisabled: false
    },
    AudioVisualation: function (options) {
        this.options = $.extend({}, this.options, options);
        this.canvas = options['canvas'];
        this.meter = options['meter'];
        this.audio = options['audio'];
        $(this.audio).get(0).audioVisualiation = this;
        if (typeof this.canvas != "undefined") {
            this.ctx2d = this.canvas.getContext('2d');
        }
        this.renderHtml();
        if ((typeof $.browser.chrome != "undefined" && $.browser.chrome) || (typeof $.browser.safari != "undefined" && $.browser.safari)) {
            this.initWebkit();
        } else if (typeof $.browser.mozilla != "undefined" && $.browser.mozilla) {
            this.initMozilla();
        }
    },
    renderHtml: function () {
        var channels = typeof this.options['channels'] != 'undefined' ? this.options['channels'] : [{
            classes: "",
            rulePosition: "left"
        },
        {
            classes: "",
            rulePosition: "right"
        }
        ];
        for (var i = 0; i < channels.length; i++) {
            var channel = channels[i];
            var channelHtml = '<div class="meter-channel ' + channel["classes"] + '">' +
            '<div class="meter-background">' +
            '<div class="meter-over"></div>' +
            '<div class="meter-warning"></div>' +
            '<div class="meter-good"></div>' +
            '</div>' +
            '<div class="meter-rule meter-rule-' + channel["rulePosition"] + '">' +
            '<div class="meter-rule-no meter-0">0</div>' +
            '<div class="meter-rule-no meter--9">-09</div>' +
            '<div class="meter-rule-no meter--18">-18</div>' +
            '<div class="meter-rule-no meter--22">-22</div>' +
            '<div class="meter-rule-no meter--26">-26</div>' +
            '<div class="meter-rule-no meter--32">-32</div>' +
            '<div class="meter-rule-no meter---">-<span>o</span><span style="    margin-left: -2px;">o</span></div>' +
            '</div>' +
            '<div class="meter">' +
            '</div>' +
            '<div class="peaker"></div>' +
            '</div>';
            $(this.meter).append(channelHtml);
        }
        var that = this;
        that.meterChannels = [];
        $(this.meter).children(".meter-channel").each(function () {
            var channel = this;
            var meter = $(this).children(".meter").get(0);
            var peaker = $(this).children(".peaker").get(0);
            that.meterChannels.push({
                channel: channel,
                meter: meter,
                peaker: peaker
            });
        });
    },
    initWebkit: function () {
        try {
            try {
                WaveSurfer.Drawer.init({
                    container: document.querySelector('.waveform'),
                    fillParent: true,
                    markerColor: 'rgba(0, 0, 0, 0.5)',
                    frameMargin: 0.1,
                    maxSecPerPx: parseFloat(location.hash.substring(1)),
                    loadPercent: true,
                    waveColor: 'violet',
                    progressColor: 'purple',
                    loaderColor: 'purple',
                    cursorColor: 'navy'
                });
            } catch (e) {
                console.log(e);
            }
            if (typeof this.ctx == "undefined" || this.ctx == null)
                this.ctx = new AudioContext();

            if (typeof this.ctx != "undefined" && this.ctx !== null) {
                var that = this;
                // 2048 sample buffer, 1 channel in, 1 channel out

                that.processor = that.ctx.createScriptProcessor(that.options.sampleLength, 4, 4);
                that.compressor = that.ctx.createDynamicsCompressor();
                that.audio.addEventListener('canplaythrough', that.loadedMetadataWebkit(that), false);
                that.audio.addEventListener('seeking', that.onTimeChanged, false);
                that.audio.addEventListener('play', that.onplay, false);
                that.audio.addEventListener('playing', that.onplay, false);
                that.audio.addEventListener('pause', that.onstoped, false);
                that.audio.addEventListener('ended', that.onstoped, false);
                // loop through PCM data and calculate average
                // volume for a given 2048 sample buffer
                that.processor.onaudioprocess = function (evt) {
                    AudioVisualation.audioProcessWebkit(evt, that);
                };
                return true;
            } else {
                console.log(this.ctx);
                return false;
            }
        } catch (e) {
            console.log(e);
            return false;
        }

    },
    initMozilla: function () {
        try {
            var that = this;
            that.audio.addEventListener('canplaythrough', that.loadedMetadataMozilla(that), false);
            that.audio.addEventListener('mozaudioavailable', that.audioProcessMozilla, false);
            return true;
        } catch (e) {
            return false;
        }
    },

    loadedMetadataWebkit: function (that) {

        that.source = that.ctx.createMediaElementSource(that.audio);
        that.source.onended = function () {
            that.destroy();
        };
        that.analyser = that.ctx.createAnalyser();
        that.analyser.smoothingTimeConstant = 0.3;
        that.analyser.fftSize = 1024;
        that.analyser.connect(that.ctx.destination);
        that.byteTimeDomain = new Uint8Array(1024);
        that.byteFrequency = new Uint8Array(1024);
        that.source.connect(that.analyser);
        that.source.connect(that.processor);
        that.source.connect(that.ctx.destination);
        that.processor.connect(that.ctx.destination);
        that.fft = new FFT(that.options.sampleLength, 44100);
        if (that.options.autoPlay) that.audio.play();
        //    that.graphWavesurfer();
        that.initSuccess = true;
        console.log("loaded");
    },

    audioProcessWebkit: function (evt, that) {
        if (!that.disabled) {
            var input1 = evt.inputBuffer.getChannelData(0)
            , input2 = evt.inputBuffer.getChannelData(1)
            ;
            //      console.log("in1:",input1,"in2:",input2,"in3:",input3,input4);
            if (!that.options.vuDisabled) {
                for (var i = 0; i < that.meterChannels.length; i++) {
                    that.graphVU(evt.inputBuffer.getChannelData(i), that.meterChannels[i]);
                }
            }
            if (!that.options.drumDisabled) {
                that.graphSpeakTrum($.merge(input1, input2));
            }
        }
    },

    playSound: function () {
        var that = this;
        var oneShotSound = that.ctx.createBufferSource();
        oneShotSound.buffer = that.currentBuffer;

        // Create a filter, panner, and gain node.
        var lowpass = that.ctx.createBiquadFilter();
        var panner = that.ctx.createPanner();
        var gainNode2 = that.ctx.createGain();

        // Make connections
        oneShotSound.connect(panner);
        //    lowpass.connect(panner);
        panner.connect(that.compressor);
        //    gainNode2.connect(that.compressor);
        that.compressor.connect(that.ctx.destination);
        // Play 0.75 seconds from now (to play immediately pass in 0)
        oneShotSound.start(that.ctx.currentTime + 0.75);
    },

    onplay: function () {
        var that = event.target.audioVisualiation;
        that.clearPeakInterval = setInterval(function () {
            that.clearPeak();
        }, that.options.clearPeakInterval);
    },

    onstoped: function () {
        var that = event.target.audioVisualiation;
        that.clearVu();
    },

    play: function (start, dur, delay) {
        if (!this.currentBuffer) {
            return;
        }

        this.pause();
        var oneShotSound = this.ctx.createBufferSource();
        var len = this.currentBuffer.length * dur / this.currentBuffer.duration;
        var buff = this.ctx.createBuffer(
          this.currentBuffer.numberOfChannels,
          len,
          this.currentBuffer.sampleRate);
        oneShotSound.buffer = buff;
        this.lastStart = start;
        this.startTime = this.ctx.currentTime;
        oneShotSound.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
        oneShotSound.start(this.ctx.currentTime + delay);
        this.paused = false;
    },
    /**
       * Pauses the loaded audio.
       */
    pause: function (delay) {
        if (!this.currentBuffer || this.paused) {
            return;
        }

        this.lastPause = this.getCurrentTime();

        //    this.source.noteOff(delay || 0);

        this.paused = true;
    },

    isPaused: function () {
        return this.paused;
    },

    getCurrentTime: function () {
        if (this.isPaused()) {
            return this.lastPause;
        } else {
            return this.lastStart + (this.ctx.currentTime - this.startTime);
        }
    },

    loadedMetadataMozilla: function (that) {
        //    var that = this;
        that.channels = 2;
        //    var rate              = that.audio.mozSampleRate;
        //    that.frameBufferLength = that.audio.mozFrameBufferLength;
        //    that.fft = new FFT(that.frameBufferLength, rate);
        if (that.options.autoPlay) that.audio.play();
        that.initSuccess = true;
    },

    audioProcessMozilla: function (event) {
        var that = this;
        if (!that.disabled) {
            var fb = event.frameBuffer,
            t = event.time, /* unused, but it's there */
            signal1 = new Float32Array(fb.length / that.channels),
            signal2 = new Float32Array(fb.length / that.channels),
            magnitude;
            for (var i = 0, fbl = that.frameBufferLength / 2; i < fbl; i++) {
                // Assuming interlaced stereo channels,
                // need to split and merge into a stero-mix mono signal
                signal1[i] = (fb[2 * i]);
            }
            for (var i = 0, fbl = that.frameBufferLength / 2; i < fbl; i++) {
                // Assuming interlaced stereo channels,
                // need to split and merge into a stero-mix mono signal
                signal2[i] = (fb[2 * i + 1]);
            }
            if (!that.options.drumDisabled) {
                that.graphSpeakTrum(fb);
            }
            if (!that.options.vuDisabled) {
                that.graphVU(signal1, that.meterChannels[0]);
                if (that.meterChannels.length > 1)
                    that.graphVU(signal2, that.meterChannels[1]);
            }
        }
    },

    graphSpeakTrum: function (buffer) {
        var
        fb = buffer,
        len1 = buffer.length,
        //            t  = evt.time, /* unused, but it's there */
        signal = new Float32Array(len1),
        magnitude;

        for (var i = 0, fbl = len1 / 2; i < fbl; i++) {
            // Assuming interlaced stereo channels,
            // need to split and merge into a stero-mix mono signal
            signal[i] = (fb[2 * i] + fb[2 * i + 1]) / 2;
        }
        if (this.fft) {
            this.fft.forward(signal);

            // Clear the canvas before drawing spectrum
            this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx2d.fillStyle = "rgba(50, 50, 50, 0.5)"
            for (var i = 0; i < this.fft.spectrum.length; i++) {
                // multiply spectrum by a zoom value
                magnitude = this.fft.spectrum[i] * 4000;

                // Draw rectangle bars for each frequency bin
                this.ctx2d.fillRect(i * 4, this.canvas.height, 3, -magnitude);
            }
        }
    },

    graphVU: function (buffer, meterChannel) {
        var peak = Math.max.apply(null, buffer);
        // standard <=-18 135px ; warning <=-9 182px
        // 7.6px ~ 1.5 dbFS/1 level
        // 6 level error > -9
        // 6 level warning from -18 to -9
        // 18 level good => min = -18 - 18*1.5 = -45 dbFS
        // px = (45-dbFS)/1.5*7.6
        // % = Math.abs(dbFS)/45*100;
        var dbFS = 20 * log10(Math.abs(peak));
        if (dbFS == "-Infinity") {
            dbFS = 45;
        }
        var currentHeight = meterChannel.meter.clientHeight;
        var meterHeight = Math.min(Math.abs(dbFS) / 45 * 100, 100);

        var currentHeightPercent = Math.min(currentHeight / this.meter.clientHeight * 100, 100);

        meterHeight = (currentHeightPercent < 90 && (meterHeight > currentHeightPercent + 1 || meterHeight > 95)) ? (currentHeightPercent + 1) : meterHeight;

        meterChannel.meter.style.height = meterHeight + "%";

        var newHeight = meterChannel.meter.clientHeight;
        meterChannel.peaker.lastValue = newHeight;
        if (newHeight < meterChannel.peaker.offsetTop) {
            meterChannel.peaker.style.top = newHeight + "px";
            meterChannel.peaker.topValue = newHeight;
        }
        this.currentPeak = peak;
    },

    clearVu: function () {
        var that = this;
        that.clearVuIntervalId = setInterval(function () {
            that.clearVuInterval();
        }, 20);
    },

    clearVuInterval: function () {
        var isChanged = false;
        var height = this.meter.clientHeight;
        for (var i = 0; i < this.meterChannels.length; i++) {
            var meterH = this.meterChannels[i].meter.clientHeight;
            if (meterH < height) {
                isChanged = true;
                var mH = Math.min(meterH + 5, height);
                this.meterChannels[i].meter.style.height = mH + "px";
                this.meterChannels[i].peaker.style.top = mH + "px";
                this.meterChannels[i].peaker.lastValue = mH;
            }
        }
        if (!isChanged) {
            clearInterval(this.clearVuIntervalId);
        }
    },

    clearPeak: function () {
        for (var i = 0; i < this.meterChannels.length; i++) {
            var peaker = this.meterChannels[i].peaker;
            if (peaker.lastValue > peaker.topValue) {
                peaker.topValue = peaker.lastValue;
                peaker.style.top = peaker.topValue + "px";
            }
        }
        if (!this.audio.paused) {
            clearInterval(this.clearPeakInterval);
        }
    },

    clearDrum: function () {
        this.ctx2d.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    graphWavesurfer: function () {
        if (!this.options.waveDisabled && typeof WaveSurfer != "undefined" && !this.audio.paused && WaveSurfer.Drawer.container != null) {
            var peak = this.currentPeak;
            //        console.log("wavesurfer",peak);
            if (peak > 0) {
                try {
                    WaveSurfer.Drawer.drawPeak(peak, 2);
                } catch (e) {
                    console.log("wavesurfer err", e);
                }
            }
            var that = this;
            setTimeout(function () {
                that.graphWavesurfer();
            }, this.options.graphWaveInterval);
        }
    },

    waveform: function () {
        this.analyser.getByteTimeDomainData(this.byteTimeDomain);
        return this.byteTimeDomain;
    },

    onTimeChanged: function () {

    },
    /**
       * Loads an audio file via XHR.
       */
    load: function (url) {
        var my = this;
        var xhr = my.createCORSRequest('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.addEventListener('progress', function (e) {
            my.loadData(
              e.target.response,
              my.drawBuffer.bind(my)
              );
        }, false);
        xhr.send();
    },
    loadData: function (audiobuffer, cb, errb) {
        if (audiobuffer) {
            var my = this;
            this.ctx.decodeAudioData(
              audiobuffer,
              function (buffer) {
                  my.currentBuffer = buffer;
                  my.lastStart = 0;
                  my.lastPause = 0;
                  my.startTime = null;
                  cb && cb(buffer);
              },
              function () {
                  console.error('Error decoding audio buffer');
                  errb && errb();
              }
              );
        }
    },

    createCORSRequest: function (method, url) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
            // XHR for Chrome/Firefox/Opera/Safari.
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest != "undefined") {
            // XDomainRequest for IE.
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            // CORS not supported.
            xhr = null;
        }
        return xhr;
    },
    drawBuffer: function () {
        var peaks = this.getPeaks(1900);
        var max = -Infinity;
        for (var i = 0; i < 1900; i++) {
            var val = peaks[i];
            if (val > max) {
                max = val;
            }
        }
        try {
            WaveSurfer.Drawer.drawPeaks(peaks, 2);
        } catch (e) {
            console.log("wavesurfer err", e);
        }

        //        this.fireEvent('ready');
    },
    /**
       * @returns {Float32Array} Array of peaks.
       */
    getPeaks: function (length, sampleStep) {
        sampleStep = sampleStep || 100;
        var buffer = this.currentBuffer;
        var k = buffer.length / length;
        var peaks = new Float32Array(length);

        for (var c = 0; c < buffer.numberOfChannels; c++) {
            var chan = buffer.getChannelData(c);

            for (var i = 0; i < length; i++) {
                var peak = -Infinity;
                var start = ~~(i * k);
                var end = (i + 1) * k;
                for (var j = start; j < end; j += sampleStep) {
                    var val = chan[j];
                    if (val > peak) {
                        peak = val;
                    } else if (-val > peak) {
                        peak = -val;
                    }
                }

                if (c > 0) {
                    peaks[i] += peak;
                } else {
                    peaks[i] = peak;
                }
            }
        }

        return peaks;
    },

    destroy: function () {
        var that = this;
        if (that.source != null) {
            that.source.disconnect(that.analyser);
            that.source.disconnect(that.processor);
        }
        if (that.analyser != null) {
            that.analyser.disconnect(that.ctx.destination);
        }
        if (that.processor != null) {
            that.processor.disconnect(that.ctx.destination);
            that.processor.removeEventListener()
        }
        if (this.ctx != null)
            this.ctx.close();
        console.log("destroyed");
    }
}
function log10(val) {
    return (Math.log(val) / Math.LN10);
};

var FFT = function (bufferSize, sampleRate) {
    this.bufferSize = bufferSize;
    this.sampleRate = sampleRate;
    this.spectrum = new Float32Array(bufferSize / 2);
    this.real = new Float32Array(bufferSize);
    this.imag = new Float32Array(bufferSize);
    this.reverseTable = new Uint32Array(bufferSize);
    this.sinTable = new Float32Array(bufferSize);
    this.cosTable = new Float32Array(bufferSize);

    var limit = 1,
    bit = bufferSize >> 1;

    while (limit < bufferSize) {
        for (var i = 0; i < limit; i++) {
            this.reverseTable[i + limit] = this.reverseTable[i] + bit;
        }

        limit = limit << 1;
        bit = bit >> 1;
    }

    for (var i = 0; i < bufferSize; i++) {
        this.sinTable[i] = Math.sin(-Math.PI / i);
        this.cosTable[i] = Math.cos(-Math.PI / i);
    }
};

FFT.prototype.forward = function (buffer) {
    var bufferSize = this.bufferSize,
    cosTable = this.cosTable,
    sinTable = this.sinTable,
    reverseTable = this.reverseTable,
    real = this.real,
    imag = this.imag,
    spectrum = this.spectrum;

    if (bufferSize !== buffer.length) {
        throw "Supplied buffer is not the same size as defined FFT. FFT Size: " + bufferSize + " Buffer Size: " + buffer.length;
    }

    for (var i = 0; i < bufferSize; i++) {
        real[i] = buffer[reverseTable[i]];
        imag[i] = 0;
    }

    var halfSize = 1,
    phaseShiftStepReal,
    phaseShiftStepImag,
    currentPhaseShiftReal,
    currentPhaseShiftImag,
    off,
    tr,
    ti,
    tmpReal,
    i;

    while (halfSize < bufferSize) {
        phaseShiftStepReal = cosTable[halfSize];
        phaseShiftStepImag = sinTable[halfSize];
        currentPhaseShiftReal = 1.0;
        currentPhaseShiftImag = 0.0;

        for (var fftStep = 0; fftStep < halfSize; fftStep++) {
            i = fftStep;

            while (i < bufferSize) {
                off = i + halfSize;
                tr = (currentPhaseShiftReal * real[off]) - (currentPhaseShiftImag * imag[off]);
                ti = (currentPhaseShiftReal * imag[off]) + (currentPhaseShiftImag * real[off]);

                real[off] = real[i] - tr;
                imag[off] = imag[i] - ti;
                real[i] += tr;
                imag[i] += ti;

                i += halfSize << 1;
            }

            tmpReal = currentPhaseShiftReal;
            currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
            currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
        }

        halfSize = halfSize << 1;
    }

    i = bufferSize / 2;
    while (i--) {
        spectrum[i] = 2 * Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / bufferSize;
    }
};
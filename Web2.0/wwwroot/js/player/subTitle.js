/*
 * Player
 * srcMode=3:lowres; 1:origin; >4:temp
 */
var clipboard = [];
var _duration = 0;
var _timeCurrent = 0;
var _rate = 1;
var _newTime = 0;
var _counter = 0;
var _initialized = false;
var _rendered = false;
var _autoPlay = true;
var _playerId;
var _type = "webm";
var _html5Support = true;
var _total_width;
var _startTime = 0;
var _endTime = 0;
var _startOffset = 0;
var _endOffset = 0;
var _startTimeCounter = 0;
function getPlayer() {
    hdplayer = {
        defaultOptions: {
            itemId: 9007199254740992,
            playerH: 370,
            playerW: 640,
            subPX: 0,
            subPY: 350,
            subW: 640,
            subH: 20
        },
        render: function (playerContent, src, options) {
            if (typeof options['mode'] != "undefined" && options['mode'] == "mobile") {
                rendMobile(playerContent, src, options);
            }
            else {
                rend(playerContent, src, options);
            }
        },
        init: function () {

        },
        play: function () {
            hdplay();
        },
        pause: function () {
            hdstop();
        },
        playNpause: function () {
            playNpause();
        },
        rate: function (rate) {
            setPlaybackRate(rate);
        },
        destroy: function () {

        },
        enterFullScreen: function () {
            toggleFullScreen();
        },
        getElementPlayer: function () {
            return _elementPlayer;
        },
        getHtml5Supported: function () {
            if (_initialized) {
                return _html5Support;
            } else {
                //        var formatSupported =detectBrowserVideoFormat();
                //        alert("call init() or render() first. Your browser supported:"+ "\nwebm:" +formatSupported["webm"]  +"\nH264:"+ formatSupported["h264"] + "\nogg:"+ formatSupported["ogg"] +"\nmpeg4:" + formatSupported["mpeg4"]);
                return detectBrowserVideoFormat();
            }
        },
        setCurrentTime: function (time) {
            setCurrentTime(time);
        },
        getCurrentTime: function () {
            if (!document.getElementById(_playerId)) {
                return 0;
            }
            if (document.getElementById(_playerId).srcMode == 3
              && _html5Playing) {
                return document.getElementById(_playerId).currentTime;
            } else if (document.getElementById(_playerId).srcMode != 3
              || !_html5Playing) {
                return document.getElementById(_playerId).input.time / 1000;
            }
        },
        isInitialized: function () {
            return _initialized;
        },
        buildCurrentProgress: function (time) {
            buildCurrentProgress(time);
        },
        loadSrc: function (src) {
            var time = new Date().getTime();
            var width = $("#player0").width();
            var height = $("#player0").height() - 30;
            if (typeof src != "undefined" && getFileExtention(src) == "mp4") {
                $("#" + _playerId).replaceWith('<video width="' + width + '"height="' + height + '" ' +
                  ' id="' + _playerId + '" poster="' + _basePath + '/images/hdvietnam.png"' +
                  ' >' +
                  '</video>');
                $("#" + _playerId).append("<source src=\"" + src + "?" + time + "\">");
            } else if (typeof src != "undefined") {
                $("#" + _playerId).replaceWith('<embed id="' + _playerId + '" type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" version="VideoLAN.VLCPlugin.2" name="plugin" src="' + src + '?' + time + '" controls=false width="' + width + '"height="' + height + '" ' + '>');
            }
        },
        reset: function () {
            try {
                hdplayer.pause();
                _elementPlayer.src = "";
                _elementPlayer.load();
                $("#timeCurrent").width(0);
                $("#curentTime").text("00:00:00.00");
                $("#subtitlePreview").text("");
            } catch (e) {

            }
        },
        onError: function (e) {
            handlePlaybackError();
        },
        first: function () {
            var originStatus = this.paused() ? "paused" : "";
            this.pause();
            _playSub = false;
            this.setCurrentTime(convertStringToMs(_elementPlayer.startTimeOffset) / 1000 - convertStringToMs(_elementPlayer.startTime) / 1000);
            $(".mam_timeCount").val(convertTimeToString(_startOffset));
            if (originStatus != "paused") {
                var that = this;
                setTimeout(function () {
                    _playSub = true;
                    that.play();
                    playSub();
                }, 100);

            }
        },
        last: function () {
            this.setCurrentTime(Math.abs(convertStringToMs(_elementPlayer.endTimeOffset) / 1000 - convertStringToMs(_elementPlayer.startTime) / 1000));
            this.play();
        },
        ffbw: function () {
            btClick = !btClick;
            if (btClick) {
                hdstop();
                _elementPlayer.currentTime -= 0.08;
                fastPrev(5);
            }
        },
        fffw: function () {
            btClick = !btClick;
            if (btClick) {
                this.play();
                this.rate(64);
            } else {
                this.rate(1);
            }
        },
        savePlayerData: function () {
            savePlayerData();
        },
        resume: function () {
            savePlayerData();
            if (typeof _elementPlayer != "undefined" &&
              _elementPlayer != null && _elementPlayer.currentTime > 0) {
                $('#player_loading').removeClass("hidden");
                initPlayer();
            }
        },
        paused: function () {
            if (document.getElementById(_playerId).srcMode == 3) {
                return _elementPlayer.paused;
            } else {
                return !document.getElementById(_playerId).playlist.isPlaying;
            }
        }
    };
    return hdplayer;
}

function checkBrowserSupport(format) {
    var formatSupported = detectBrowserVideoFormat();
    if (format in formatSupported && formatSupported[format] != "undefined") {
        return formatSupported[format];
    }
    return false;
}

function detectBrowserVideoFormat() {
    var testEl = document.createElement("video"), mpeg4, h264, ogg, webm;
    if (testEl.canPlayType) {
        // Check for MPEG-4 support
        mpeg4 = "" !== testEl.canPlayType('video/mp4; codecs="mp4v.20.8"');

        // Check for h264 support
        h264 = "" !== (testEl.canPlayType('video/mp4; codecs="avc1.42E01E"')
          || testEl.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'));

        // Check for Ogg support
        ogg = "" !== testEl.canPlayType('video/ogg; codecs="theora"');

        // Check for Webm support
        webm = "" !== testEl.canPlayType('video/webm; codecs="vp8, vorbis"');
    }
    return {
        "mpeg4": mpeg4,
        "h264": h264,
        "ogg": ogg,
        "webm": webm
    };
}

function rendMobile(playerContent, src, options) {
    if (typeof playerContent == "undefined" || playerContent == "" || !$("#" + playerContent)) {
        alert("Missing playerContent in function render()");
    } else {
        _playerId = playerContent + '0';
        //        _player1Id = playerContent + '1';
        playerContent = "#" + playerContent;
        $(playerContent).addClass("hdsubtitle");
        if (typeof src == "undefined" || !src) {
            src = $(playerContent).attr("videoUrl");
            src = src.split(",");
        } else {
            src = [src];
        }
        var width = $(playerContent).width();
        var height = $(playerContent).height() - 30;
        if (typeof options != "undefined") {
            width = ("width" in options) ? options["width"] : width;
            height = ("height" in options) ? options["height"] : height;
            _type = ("type" in options) ? options["type"] : _type;
            _playerSafetyFrame = ("safetyFrame" in options) ? options['safetyFrame'] : false;
        }
        $(playerContent).html('<video width="' + width + '"height="' + height + '" controls' +
          ' id="' + _playerId + '" poster="' + _basePath + '/images/hdvietnam.png"' +
          ' >' +
          '</video>'
          );
        _autoPlay = (typeof options != "undefined" && 'autoPlay' in options) ? options['autoPlay'] : _autoPlay;
        $("#subTitleFormx").css("display", "none");
        $("#videoSpeedSelect").css("display", "none");
        $("#xxx .column-first").css("height", "auto");
        $(playerContent)[0].style.cssText += ";height:auto !important;";
        _rendered = true;
        var time = new Date().getTime();
        for (var i = 0; i < src.length; i++) {
            if (src[i])
                $("#" + _playerId).append("<source src=\"" + src[i] + "?" + time + "\">");
        }
        _initialized = true;
    }
}

function rend(playerContent, src, options) {
    if (typeof playerContent == "undefined" || playerContent == "" || !$("#" + playerContent)) {
        alert("Missing playerContent in function render()");
    } else {
        _playerId = playerContent + '0';
        //        _player1Id = playerContent + '1';
        playerContent = "#" + playerContent;
        hdplayer.playerContent = playerContent;
        $(playerContent).addClass("hdsubtitle");
        if (typeof src == "undefined" || !src) {
            src = $(playerContent).attr("videoUrl");
            src = src.split(",");
        } else {
            src = [src];
        }
        var width = $(playerContent).width();
        var height = $(playerContent).height() - 30;
        if (typeof options != "undefined") {
            width = ("width" in options) ? options["width"] : width;
            height = ("height" in options) ? options["height"] : height;
            _type = ("type" in options) ? options["type"] : _type;
            _playerSafetyFrame = ("safetyFrame" in options) ? options['safetyFrame'] : false;
        }
        var displayCurrentTime = typeof options['currentTime'] != "undefined" && options['currentTime'];
        if (typeof options['srcMode'] == "undefined") {
            options['srcMode'] = 3;
        }
        //    src="'+src+'?'+time+'"
        var playerHtml = options['srcMode'] == 3 ? ('<video width="' + width + '"height="' + height + '" ' +
          ' id="' + _playerId + '" poster="' + _basePath + '/images/hdvietnam.png"' +
          ' >' +
          '</video>') : (
          '<embed id="' + _playerId + '" type="application/x-vlc-plugin" pluginspage="http://www.videolan.org" version="VideoLAN.VLCPlugin.2" name="plugin"  controls=false autoplay=false width="' + width + '"height="' + height + '" ' + '>'
          );
        $(playerContent).html(playerHtml +
          (_playerSafetyFrame ?
            ('<div id="playerSafetyFrame"></div>')
            : ""
            ) +
          '<div id="player_message" class="message-overlay"></div>' +
          '<div id="player_loading" class="mejs-overlay-loading"><span></span></div>' +
          '<div id="meter" class="vu_meter"></div>' +
          '<div><canvas id="fft" width="120" height="90"></canvas></div>' +
          '<div class="mejs-controls"  style="display: block; visibility: visible;">' +
          '<div  id="ppIcon" class="mejs-button mejs-playpause-button mejs-play">' +
          '<button title="Play/Pause" id="pp" type="button"></button>' +
          '</div>' +

          ' <div class="mejs-time mejs-currenttime-container" style="padding:0; height:30px;">' +
          '<input id="startTime" class="mejs-currenttime" value="00:00:00:00" onclick="this.select()" style="' +
          'width: 70px; height:13px; margin:0;' +
          'background: transparent;' +
          'color: white;' +
          'border: none;' +
          'font-size: 11px;' +
          'font-family: sans-serif;' +
          '">' +
          '<input class="mam_timeCount mejs-currenttime" value="00:00:00:00" onclick="this.select()" style="' +
          'width: 70px; height:13px; margin:0;' +
          'background: transparent;' +
          'color: white;' +
          'border: none;' +
          'font-size: 11px;' +
          'font-family: sans-serif;' +
          '">' +
          ' <br/><br/>' +

          '</div>  <div class="mejs-time-rail" style="width: 68%;">   <span id="timeTotal"  class="mejs-time-total" style="width: 66%;">    <span id="timeLoaded" class="mejs-time-loaded" style="width: 0px;"></span>' +
          '<div id="timeCurrent" class="mejs-time-current" style="width: 0px;height:10px"></div>' +
          '<div class="sm2-progress-ball" style="position: static;"><div class="icon-overlay"></div>' +
          '<div id="curentTime" ' + (displayCurrentTime ? '' : 'class="hidden"')
          + ' style="width: 2px;padding-top: 14px; margin-left: -25px;"></div>' +
          '</span>       </div>     </div>   \n\
            <div class="mejs-time mejs-duration-container" style="padding: 0;height: 30px;">           \n\
            '+
          '<input id="endTime" class="mejs-duration" value="00:00:00:00" onclick="this.select()" style="' +
          'width: 70px; height:13px;' +
          'background: transparent;' +
          'color: white;' +
          'border: none;' +
          'font-size: 11px;' +
          'font-family: sans-serif;' +
          '">' +
          '<input id="duration" class="mejs-duration" value="00:00:00:00" onclick="this.select()" style="' +
          'width: 70px; height:13px;' +
          'background: transparent;' +
          'color: white;' +
          'border: none;' +
          'font-size: 11px;' +
          'font-family: sans-serif;' +
          '">' +
          '</div>' +
          '</div>'
          );
        _isFirstTime = true;
        document.getElementById(_playerId).srcMode = options['srcMode'];
        document.getElementById(_playerId).srcArr = src;
        initPlayerEvent();
        initPlayer();
        initVisualizer();
        //        alert(_playerId.type);
        pinit(options);

    }
}

function savePlayerData() {
    if (document.getElementById(_playerId) &&
      typeof document.getElementById(_playerId).currentTime != "undefined"
      && document.getElementById(_playerId).currentTime > 0
      && typeof document.getElementById(_playerId).fileName != "undefined") {
        //$.cookie("hdstation_player_currentTime_" +
        //  document.getElementById(_playerId).fileName,
        //  document.getElementById(_playerId).currentTime,
        //  {
        //      'expires': 2
        //  });
    }
}
var _isFirstTime = false;
function initPlayerEvent() {
    if (document.getElementById(_playerId).srcMode == 3) {
        document.getElementById(_playerId).addEventListener("error", function () {
            if (document.getElementById(_playerId)) {
                document.getElementById(_playerId).srcErrCount++;
                if (typeof document.getElementById(_playerId).isStalled != "undefined"
                  && document.getElementById(_playerId).isStalled) {
                    $('#player_message').html("");
                    $('#player_loading').removeClass("hidden");
                    setTimeout(function () {
                        _elementPlayer.load();
                    }, 4500);
                } else
                    if (document.getElementById(_playerId).srcErrCount ===
                      document.getElementById(_playerId).srcCount) {
                        $('#player_message').html(_translator.translate('This video unavailable!'));
                        $('#player_loading').addClass("hidden");
                        hdplayer.resume();
                    }
                //      hdplayer.resume();
            }
        }, true);
        document.getElementById(_playerId).addEventListener("canplay", function () {
            $('#player_message').html('');
            $('#player_loading').addClass("hidden");
            $(".icon-overlay").css("display", "");
            if (_isFirstTime) {
                _isFirstTime = false;
                if (typeof document.getElementById(_playerId).fileName != "undefined") {
                    //var currentTime = $.cookie("hdstation_player_currentTime_" +
                    //  document.getElementById(_playerId).fileName);
                    var currentTime = "undefined";
                    if (typeof currentTime != "undefined"
                      && currentTime > 0
                      && currentTime < _elementPlayer.duration - 1
                      ) {
                        _elementPlayer.currentTime = currentTime;
                        if (typeof _elementPlayer.isStalled != "undefined"
                          && _elementPlayer.isStalled) {
                            hdplay();
                        } else {
                            timeStep();
                        }
                    } else {
                        if (_elementPlayer.startTime != _elementPlayer.startTimeOffset) {
                            _elementPlayer.currentTime = convertStringToMs(_elementPlayer.startTimeOffset) / 1000 - convertStringToMs(_elementPlayer.startTime) / 1000;
                        }
                    }
                }
            }
        }, true);
        document.getElementById(_playerId).addEventListener("durationchange", setDuration, true);
        document.getElementById(_playerId).addEventListener("waiting", videoEventWaitting, true);
        document.getElementById(_playerId).addEventListener("stalled", videoEventStalled, true);
    } else {
        registerVLCEvent('MediaPlayerPaused', handleVlcPaused);
        registerVLCEvent('MediaPlayerPlaying', handleVlcPlaying);
        registerVLCEvent('MediaPlayerTimeChanged', handleVlcTimeChanged);
        registerVLCEvent('MediaPlayerLengthChanged', handleVlcLengthChanged);
        registerVLCEvent('MediaPlayerEncounteredError', handlePlaybackError);
    }
}
function initPlayer() {
    _rendered = true;
    if (document.getElementById(_playerId).srcMode == 3) {
        var time = new Date().getTime();
        var src = document.getElementById(_playerId).srcArr;
        document.getElementById(_playerId).srcCount = 0;
        document.getElementById(_playerId).srcErrCount = 0;
        $("#" + _playerId).html("");
        for (var i = 0; i < src.length; i++) {
            if (src[i]) {
                document.getElementById(_playerId).fileName = getFileNameFromPath(src[i]);
                $("#" + _playerId).append("<source src=\"" + src[i] + "?" + time + "\">");
                document.getElementById(_playerId).srcCount++;
            }
        }
        document.getElementById(_playerId).load();
    } else {
        var vlc = document.getElementById(_playerId);
        if (typeof vlc.srcArr != "undefined" && vlc.srcArr.length > 0) {
            var id = vlc.playlist.add(vlc.srcArr[0], "", {});
            vlc.playlist.playItem(id);
        }
    }
}
function pinit(options) {
    _autoPlay = (typeof options != "undefined" && 'autoPlay' in options) ? options['autoPlay'] : _autoPlay;
    if (_rendered) {
        if (checkBrowserSupport(_type) != "undefined" && checkBrowserSupport(_type)
          && document.getElementById(_playerId).srcMode == 3) {
            _html5Support = true;
            _elementPlayer = document.getElementById(_playerId);
            _html5Playing = true;
            _initialized = true;
            _elementPlayer.volume = 1;
            setTotalWidth();
            _counter = 0;

            if (!window.mobilecheck()) {
                $(".mejs-time-rail").mousedown(function (e) {
                    handleMouseOverClickHtml5(e);
                    $(".mejs-controls").addClass("grabbing");
                    if (_elementPlayer.paused) {
                        $(this).get(0).originStatus = "paused";
                        hdplay();
                    }
                    $('#player_loading').css("display", "none");
                    $(this).mousemove(function (e) {
                        if (_newTime <= _startOffset) {
                            _newTime = _startOffset;
                        }
                        if (_newTime >= _endOffset) {
                            _newTime = _endOffset;
                        }
                        buildCurrentProgress(_newTime - _startOffset);
                        $("#curentTime").text(convertTimeToString(_newTime + _startOffset));
                        $("input.curentTime").val(convertTimeToString(_newTime + _startOffset));
                        var timecout = _newTime + _startOffset - _startTimeCounter + 0.04;
                        $(".mam_timeCount").val(convertTimeToString(timecout > 0 ? timecout : 0));
                        _elementPlayer.currentTime = _newTime - _startOffset;
                    });
                });
                $(".mejs-time-rail").mouseup(function () {
                    $(this).unbind("mousemove");
                    $(".mejs-controls").removeClass("grabbing");
                    $('#player_loading').css("display", "");
                    if (typeof $(this).get(0).originStatus != "undefined"
                      && $(this).get(0).originStatus == "paused") {
                        hdstop();
                        if (typeof _newTime != "undefined") {
                            _elementPlayer.currentTime = _newTime - _startOffset;
                        }
                    }
                });
                $("#timeTotal").mousemove(function (e) {
                    handleMouseOver(e);
                });
                $("#timeTotal").mouseout(function (e) {
                    $("#status").text('');
                });
            }
            $("#pp").click(function () {
                playNpause();
            });
            if (_autoPlay == 'true') {
                hdplay();
            }

        } else {
            _initialized = true;
            _elementPlayer = document.getElementById(_playerId);
            _html5Playing = false;
            setTotalWidth();
            $("#timeTotal").click(function (e) {
                handleMouseOverClick(e);
            });
            $("#timeTotal").mousemove(function (e) {
                handleMouseOver(e);
            });
            $("#timeTotal").mouseout(function (e) {
                $("#status").text('');
            });
            $("#pp").click(function () {
                playNpause();
            });
            if (_autoPlay == 'true') {
                hdplay();
            } else {
                hdstop();
            }
        }
    } else {
        alert("call render() first");
    }
}

function videoEventStalled() {
    document.getElementById(_playerId).isStalled = true;
    savePlayerData();
    _elementPlayer.load();
}

function videoEventWaitting() {
    $('#player_loading').removeClass("hidden");
    $(".icon-spin3").css("display", "block");
}

function registerVLCEvent(event, handler) {
    var vlc = document.getElementById(_playerId);
    if (vlc) {
        if (vlc.attachEvent) {
            // Microsoft
            vlc.attachEvent(event, handler);
        } else if (vlc.addEventListener) {
            // Mozilla: DOM level 2
            vlc.addEventListener(event, handler, false);
        } else {
            // DOM level 0
            vlc["on" + event] = handler;
        }
    }
}

// stop listening to event
function unregisterVLCEvent(event, handler) {
    var vlc = document.getElementById(_playerId);
    ;
    if (vlc) {
        if (vlc.detachEvent) {
            // Microsoft
            vlc.detachEvent(event, handler);
        } else if (vlc.removeEventListener) {
            // Mozilla: DOM level 2
            vlc.removeEventListener(event, handler, false);
        } else {
            // DOM level 0
            vlc["on" + event] = null;
        }
    }
}

function destroy() {
    _elementPlayer = null;
}

function handleMouseOver(e) {
    var x = e.pageX;
    var offset = $("#timeTotal").offset();
    var width = $("#timeTotal").width();
    var percentage = 0;
    if (x > offset.left && x <= width + offset.left) {
        percentage = ((x - offset.left) / width);
        if (_duration)
            _newTime = percentage * _duration;
        else
            _newTime = _elementPlayer.currentTime;
        _newTime += _startOffset;
        // seek to where the mouse is
        // position floating time box
    }
    document.getElementById('status').innerHTML = ("go to: " + convertTimeToString(_newTime));
}

function handleMouseOverClick(e) {
    document.getElementById(_playerId).input.time = (_newTime * 1000);
    if (!document.getElementById(_playerId).playlist.isPlaying) {
        document.getElementById(_playerId).playlist.togglePause();
    }

}

function handleMouseOverClickHtml5(e) {
    var playing = !_elementPlayer.paused;
    if (_newTime <= _startOffset) {
        _newTime = _startOffset;
    }
    if (_newTime >= _endOffset) {
        _newTime = _endOffset;
    }
    if (!_duration) {
        setDuration();
    }
    _elementPlayer.currentTime = _newTime - _startOffset;
    try {
        hdplayer.savePlayerData();
    } catch (e) {

    }
    buildCurrentProgress(_newTime - _startOffset);
    $("#curentTime").text(convertTimeToString(_elementPlayer.currentTime + _startOffset));
    $("input.curentTime").val(convertTimeToString(_elementPlayer.currentTime + _startOffset));
    var timecout = _elementPlayer.currentTime + _startOffset - _startTimeCounter + 0.04;
    $(".mam_timeCount").val(convertTimeToString(timecout > 0 ? timecout : 0));
    if (playing) {
        hdplay();
    } else {
        hdstop();
    }
    _endTimeValue = _endOffset;
    playSub();
}

function handlePlaybackError(event) {
    if (document.getElementById(_playerId).srcMode == 3) {

    } else {
        //    alert(_translator.translate("Error. Please check network connection."));
    }
}

function handleVlcPaused(event) {
    $('#ppIcon').removeClass("mejs-pause").addClass("mejs-play");
    $('#ppBtn').removeClass("pause_btn").addClass("play_btn");
}

function handleVlcPlaying(event) {
    $('#ppIcon').removeClass("mejs-play").addClass("mejs-pause");
    $('#ppBtn').addClass("pause_btn").removeClass("play_btn");
    playSub();
}

function handleVlcTimeChanged(event) {
    _timeCurrent = document.getElementById(_playerId).input.time / 1000;
    _timeCurrent += _startOffset;
    //    //console.log(_endTimeValue);
    if (_timeCurrent >= _endOffset) {
        _timeCurrent = _endOffset;
        hdstop();
    }
    var tmp = convertTimeToString(_timeCurrent);
    var timecout = _timeCurrent - _startTimeCounter + 0.04;
    $(".mam_timeCount").val(convertTimeToString(timecout > 0 ? timecout : 0));
    $("#curentTime").text(tmp);
    $("input.curentTime").val(tmp);
    buildCurrentProgress(_timeCurrent - _startOffset);
}

function handleVlcLengthChanged(event) {
    _duration = document.getElementById(_playerId).input.length / 1000;
    var start = convertStringToTimeCode(_startTime);
    var end = convertStringToTimeCode(_endTime);
    if (_duration > 0 || end - start > 0) {
        _duration = _duration > 0 ? _duration : end - start;
        if (end && end > 0 && end < (start + _duration)) {
            _endOffset = end;
        } else {
            _endOffset = _duration;
        }
        if (start > 0 && start < end) {
            _startOffset = (start);
        } else {
            _startOffset = 0;
        }
        $("#startTime").val(convertTimeToString(_startOffset));
        $("#endTime").val(convertTimeToString(_endOffset));
        $("#duration").val(convertTimeToString(_endOffset - _startOffset + 0.04));

        resetTimecount(_startOffset);
        _duration = _endOffset - _startOffset;
        if (_autoPlay) {
            hdplay();
        }
    }
    else {
        hdstop();
    }
}

function buildCurrentProgress(time_Current) {
    var style_width = parseInt((time_Current / _duration) * _total_width);
    //console.log(time_Current, _duration, _total_width, style_width);
    $("#timeCurrent").width(style_width >= (_total_width) ? (_total_width - 10): (style_width-10));
    var m = -25;
    m -= (style_width > 415) ? style_width - 415 : 0;
    m = m + 'px';
    $("#curentTime").css('margin-left', m);

    if (_elementPlayer.currentTime <= 0 || _elementPlayer.currentTime >= _duration) {
        btClick = false;
        hdplayer.rate(_rate);
    }
}

function toggleFullScreen() {
    if (!document.mozFullScreen && !document.webkitFullScreen) {

        if (_elementPlayer.mozRequestFullScreen) {
            _elementPlayer.mozRequestFullScreen();
        } else {
            //            //console.log(_elementPlayer);
            _elementPlayer.webkitRequestFullScreen()
        }
    } else {
        if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else {
            document.webkitCancelFullScreen();
        }
    }
}

function setPlaybackRate(rate) {
    if (_initialized) {
        if (document.getElementById(_playerId)) {
            if (document.getElementById(_playerId).srcMode == 3) {
                _elementPlayer.playbackRate = rate;
            } else {
                document.getElementById(_playerId).input.rate = rate;
            }
        }
    }
    else pinit();
}

function setCurrentTime(time) {
    if (typeof _elementPlayer != "undefined") {
        //    time -= _startOffset;
        //        //console.log(_elementPlayer);
        try {
            if (_html5Playing) {
                _elementPlayer.currentTime = time;
            } else {
                _elementPlayer.input.time = time;
            }
            hdplayer.buildCurrentProgress(time);
            $("#curentTime").text(convertTimeToString(time + _startOffset));
        } catch (e) {
            $("#curentTime").text(convertTimeToString(_startOffset));
            showSub("", "");
            hdplayer.buildCurrentProgress(_startOffset);
            //            //console.log(e);
        }
    }
}

function setDuration() {
    _counter++;

    _duration = _elementPlayer.duration;
    //    _duration = 100;
    //    if((isNaN(_duration)||_duration==0) && _counter < 4){
    //        setTimeout(setDuration,500);
    //    }
    //    else
    if (_duration > 0) {
        var start = convertStringToTimeCode(_startTime);
        var end = convertStringToTimeCode(_endTime);
        if (start > 0 && start < end) {
            _startOffset = (start);
        } else {
            _startOffset = 0;
        }
        if (end && end > 0 && end < (start + _duration)) {
            _endOffset = end;
        } else {
            _endOffset = _duration + _startOffset;
        }
        $("#startTime").val(convertTimeToString(_startOffset));
        $("#endTime").val(convertTimeToString(_endOffset));
        $("#duration").val(convertTimeToString(_endOffset - _startOffset + 0.04));
        setTotalWidth();
        resetTimecount(_startOffset);
        _duration = _endOffset - _startOffset;
        if (_autoPlay) {
            hdplay();
        }
        if (_playerSafetyFrame) {
            var w = $(_elementPlayer).width();
            var h = $(_elementPlayer).height();
            var vWR = _elementPlayer.videoWidth;
            var vHR = _elementPlayer.videoHeight;
            var vH = h;
            var vW = (vH / vHR) * vWR;
            if (vW != "undefined" && vH != "undefined") {
                var fW = vW;
                var fH = vH;
                var tt = fH * 5 / 100;
                var tb = fH * 95 / 100;
                var ll = (w - vW) / 2 + fW * 5 / 100;
                var lr = (w - vW) / 2 + fW * 95 / 100;
                var html = '<div class="h-safety-frame h-safety-t" style="width:' + (fW * 9 / 10 + 2) + 'px; height:1px; top:' + (tt) + 'px; left:' + ll + 'px;"></div>';
                html += '<div class="h-safety-frame h-safety-b" style="width:' + (fW * 9 / 10 + 2) + 'px; height:1px; top:' + (tb) + 'px; left:' + ll + 'px;"></div>';
                html += '<div class="v-safety-frame v-safety-l" style="width:1px; height:' + (fH * 9 / 10 + 1) + 'px; top:' + (tt) + 'px; left:' + ll + 'px;"></div>';
                html += '<div class="v-safety-frame v-safety-r" style="width:1px; height:' + (fH * 9 / 10 + 1) + 'px; top:' + (tt) + 'px; left:' + lr + 'px;"></div>';
                $("#playerSafetyFrame").html(html);
                if ($("#subtitlePreview").hasClass("ui-draggable")) {
                    $("#subtitlePreview").css("width", (fW * 9 / 10 + 2) + "px")
                    .css("top", (tb - hdplayer.defaultOptions.subH) + 'px').css('left', ll + 15 + 'px');
                }
                hdplayer.defaultOptions.subPX = ll + 15;
                hdplayer.defaultOptions.subPY = tb - hdplayer.defaultOptions.subH;
            }
        }
    }
    else {
        hdstop();
    }
}

function setTotalWidth() {
    _total_width = $("#timeTotal").width();
}

function changePPIcon() {
    if (_elementPlayer.paused) {
        $('#ppIcon').removeClass("mejs-pause").addClass("mejs-play");
        $('#ppBtn').removeClass("pause_btn").addClass("play_btn");
    } else {
        $('#ppIcon').removeClass("mejs-play").addClass("mejs-pause");
        $('#ppBtn').addClass("pause_btn").removeClass("play_btn");
    }
}

var pers = 0;
var seconds = 0;
var totalSec = 0;
var stepStop = false;

function timeStep() {
    if (!stepStop) {
        setTimeout(timeStep, 40);
    }
    _timeCurrent = hdplayer.getCurrentTime();
    _timeCurrent += _startOffset;
    //    //console.log(_endTimeValue);
    if (_timeCurrent >= _endOffset) {
        _timeCurrent = _endOffset;
        hdstop();
    }
    var tmp = convertTimeToString(_timeCurrent);
    var timecout = _timeCurrent - _startTimeCounter + 0.04;
    $(".mam_timeCount").val(convertTimeToString(timecout > 0 ? timecout : 0));
    $("#curentTime").text(tmp);
    $("input.curentTime").val(tmp);
    buildCurrentProgress(_timeCurrent - _startOffset);
}

function hdstop() {
    if (document.getElementById(_playerId).srcMode == 3) {
        try {
            _elementPlayer.pause();
        } catch (ex) {
            try {
                _elementPlayer.stop();
            }
            catch (e) {

            }
        }
        if (_elementPlayer.paused) {
            stepStop = true;
            changePPIcon();
        }
    } else {
        document.getElementById(_playerId).playlist.pause();
    }
}

function hdplay() {
    try {
        checkCookies();
    } catch (e) { }
    var dur = _endOffset - _startOffset;
    if (document.getElementById(_playerId).srcMode == 3) {
        if (_elementPlayer.currentTime < 0 || _elementPlayer.currentTime > dur) {
            _elementPlayer.currentTime = 0;
        }
        //    //console.log("playing", _elementPlayer, _startOffset);
        _endTimeValue = _endTimeValue < dur ? _endTimeValue : dur;
        _elementPlayer.play();
        stepStop = false;//
        if (!_elementPlayer.paused) {
            if (!window.mobilecheck()) {
                setTimeout(timeStep, 100);
            }
            changePPIcon();
        }
    } else {
        if (document.getElementById(_playerId).input.time < 0 || document.getElementById(_playerId).input.time > dur * 1000) {
            document.getElementById(_playerId).input.time = 0;
        }
        _endTimeValue = _endTimeValue < dur ? _endTimeValue : dur;
        if (!document.getElementById(_playerId).playlist.isPlaying) {
            document.getElementById(_playerId).playlist.togglePause();
        }
        stepStop = false;//
        setTimeout(timeStep, 100);
    }
}

function playNpause() {
    if (document.getElementById(_playerId).srcMode == 3) {
        if (_elementPlayer.paused) {
            hdplay();
            //        _endTimeValue=0;
            _endTimeValue = _endOffset;
            if (!window.mobilecheck()) {
                playSub();
            }
        }
        else hdstop();
    } else {
        document.getElementById(_playerId).playlist.togglePause();
    }
}

/*
 * **************************************SUBTITLE *********************************************************************
 */
var _elementPlayer;
var _html5Playing = true;
var _browser;
var _startTimeValue;
var _endTimeValue;
var _subItems;
var _allSubItems;
var _subItemsPlay;
var _selectedRowsId = [];
var btClick = false;
var onFrame = false;
var fwd = false;
var setFaster = true;
var valRate;
var controlButtons = {
    ppBtn: "#ppBtn",
    prevBtn: "#prevBtn",
    fwdBtn: "#fwdBtn",
    markInBtn: "#markInBtn",
    markOutBtn: "#markOutBtn",
    addItem: "#addItem",
    playBackBtn: "#playBackBtn",
    deleteItem: "#deleteItem"
};
var controlButtonsArr = [
"#ppBtn",
"#prevBtn",
"#fwdBtn",
"#markInBtn",
"#markOutBtn",
"#addItem",
"#playBackBtn",
"#deleteItem"
];
var arrow = {
    ppBtn: 32, // space
    prevBtn: 37, // <-
    fwdBtn: 39,  // ->
    markInBtn: 188, //<
    markInBtn1: 219, // [
    markInBtn2: 231,    // [
    markOutBtn: 190, // >
    markOutBtn1: 221, // ]
    playBackBtn: 80, // p,
    insertTextBtn: 13 // enter
  ,
    markInBtn3: 77  // n
  ,
    markOutBtn3: 78  // m
  ,
    deleteBtn: 46 // delete
}

/*
 * Init *********************************************************************************************************************************
 */
function loadPlayerMobile(options) {
    if (typeof options == "undefined") {
        options = {};
    }
    hdplayer = this.getPlayer();
    hdplayer.render("player0", '', $.extend({
        'autoPlay': false,
        'safetyFrame': false,
        'mode': 'mobile'
    }, options));
    _html5Playing = hdplayer.getHtml5Supported();
    if (_html5Playing) {
        _playSub = false;
        _elementPlayer = hdplayer.getElementPlayer();
    }
    else {
        alert("Web browser not support html5 video");
    }
}

function loadPlayer(options) {
    if (typeof options == "undefined") {
        options = {};
    }
    hdplayer = this.getPlayer();
    hdplayer.render("player0", typeof options['src'] != "undefined" && options['src'] ? options['src'] : '', $.extend({
        'autoPlay': false,
        'safetyFrame': false
    }, options));
    //    //console.log("player init", hdplayer);
    if (hdplayer.isInitialized()) {
        _html5Playing = hdplayer.getHtml5Supported();
        //        BrowserDetect.init();
        if (_html5Playing) {
            _playSub = true;
            _elementPlayer = hdplayer.getElementPlayer();
            //            //console.log("player",_elementPlayer);
        }
        else {
            _elementPlayer = hdplayer.getElementPlayer();
            _playSub = false;
            //            alert("Application is currently only supported for Chrome 6+ and Firefox 5.0+");
        }
        _elementPlayer.startTime = options.startTime;
        _elementPlayer.endTime = options.endTime;
        _elementPlayer.startTimeOffset = options.startTimeOffset;
        _elementPlayer.endTimeOffset = options.endTimeOffset;
    } else {
        alert("Application is currently only supported for Chrome 6+ and Firefox 5.0+");
    }

}

function initControlButtons() {
    $("#subTitleFormx input[type='button']").unbind();
    $("#ppBtn").bind('click', function () {
        hdplayer.playNpause();
    });
    $("#prevBtn").bind("mousedown", function () {
        prevClick();
    });
    $("#prevBtn").bind("mouseup", function () {
        normalPlay();
    });
    $("#fwdBtn").bind("mousedown", function () {
        fwdClick();
    });
    $("#fwdBtn").bind("mouseup", function () {
        normalPlay()
    });
    $("#markInBtn").bind("click", function () {
        markIn();
    });
    $("#markOutBtn").bind("click", function () {
        markOut();
    });
    $("#playBackBtn").bind("click", function () {
        playBack();
    });
    $("#addItem").bind("click", function () {
        addSubItem();
    });
    $("#deleteItem").bind("click", function () {
        cancelSub();
    });
    if ($("#captureBtn").length > 0) {
        $("#captureBtn").bind("click", function () {
            captureImage();
        });
    }
    if ($("#saveTimecodeBtn").length > 0) {
        $("#saveTimecodeBtn").bind("click", function () {
            captureTimecode();
        });
    }
    $("#firstBtn").bind("click", function () {
        firstClick();
    });
    $("#lastBtn").bind("click", function () {
        lastClick();
    });
    $("#ffbwBtn").bind("click", function () {
        hdplayer.ffbw();
    });
    $("#fffwBtn").bind("click", function () {
        hdplayer.fffw();
    });
    $("#subTitleFormx input[type='button']").mouseup(document.activeElement.blur);
    document.activeElement.blur();
}

function bindKey() {
    $("textarea").livequery(function () {
        $(this).focus(function () {
            $(this).addClass("focus");
            //            //console.log(this);
        });
        $(this).blur(function () {
            $(this).removeClass("focus");
            //            //console.log(this);
        });
    });
    $(document).bind("keydown", function (e) {
        var keycode = e.keyCode || e.which;
        switch (keycode) {
            case arrow.ppBtn:
                if ($("textarea").hasClass("focus")) {

                } else {
                    hdplayer.playNpause();
                }
                break;
            case arrow.fwdBtn:
                if ($("textarea").hasClass("focus")) {

                } else {
                    if (!btClick) {
                        $(controlButtons.fwdBtn).addClass("fwrd_btn_hover");
                        fwdClick();
                    }
                }
                break;
            case arrow.prevBtn:
                if ($("textarea").hasClass("focus")) {

                } else {
                    if (!btClick) {
                        $(controlButtons.prevBtn).addClass("prev_btn_hover");
                        prevClick();
                    }
                }
                break;
            case arrow.markInBtn:
                if ($("textarea").hasClass("focus")) {

                } else {
                    $(controlButtons.markInBtn).addClass("markin_btn_hover").click();
                    e.preventDefault();
                }

                break;
            case arrow.markOutBtn:
                if ($("textarea").hasClass("focus")) {

                } else {
                    $(controlButtons.markOutBtn).addClass("markout_btn_hover").click();
                    e.preventDefault();
                }
                break;
            case arrow.playBackBtn:
                if ($("textarea").hasClass("focus")) {

                } else {
                    $(controlButtons.playBackBtn).addClass("playback_btn_hover").click();
                }
                break;
            case arrow.insertTextBtn:
                if (e.ctrlKey) {
                    addSubItem();
                } else if (typeof _subtitleEditor != "undefined") {
                    _subtitleEditor.focus();
                }
                break;
            case arrow.deleteBtn:
                var selectedRowsId = $("#subtitleTable").jqGrid('getGridParam', 'selarrrow');
                if (selectedRowsId.length > 0 && confirm(_translator.translate("Confirm for delete"))) {
                    deleteSubItem();
                }
                break;
            default:
                break;
        }
    });
    $(document).bind("keyup", function (e) {
        var keycode = e.keyCode || e.which;
        //        //console.log(keycode);
        switch (keycode) {
            case arrow.ppBtn:
                //                $(controlButtons.ppBtn).click().mouseover();
                break;
            case arrow.fwdBtn:
                if (btClick) {
                    $(controlButtons.fwdBtn).removeClass("fwrd_btn_hover");
                    normalPlay();
                }
                break;
            case arrow.prevBtn:
                if (btClick) {
                    $(controlButtons.prevBtn).removeClass("prev_btn_hover");
                    normalPlay();
                }
                break;
            case arrow.markInBtn:
                $(controlButtons.markInBtn).removeClass("markin_btn_hover");
                break;
            case arrow.markOutBtn:
                $(controlButtons.markOutBtn).removeClass("markout_btn_hover");
                break;
            case arrow.playBackBtn:
                $(controlButtons.playBackBtn).removeClass("playback_btn_hover");
                break;
            default:
                break;
        }
    });
}

function disControlButtons(controlButtonsArr) {
    $.map(controlButtonsArr, function (button) {
        $(button).attr("disabled", "disabled");
    })
}

function enbControlButtons(controlButtonsArr) {
    $.map(controlButtonsArr, function (button) {
        $(button).removeAttr("disabled");
    })
}

function onContextMenu(event) {
    $("#jqContextMenu").css("z-index", 1500);
    var rowId = $(event.target).closest("tr.jqgrow").attr("id");
    var thisTable = $("#subtitleTable");
    _selectedRowsId = thisTable.jqGrid('getGridParam', 'selarrrow');
    //            //console.log(_selectedRowsId, rowId,$.inArray(rowId,  _selectedRowsId));
    if ($.inArray(rowId, _selectedRowsId) != -1) {
        /*do something*/
    } else {
        thisTable.resetSelection();
        thisTable.setSelection(rowId, false);
        _selectedRowsId = thisTable.jqGrid('getGridParam', 'selarrrow');
    }

    var consecutive = true;
    _selectedRowsId.sort();
    for (var i = 0; i < _selectedRowsId.length - 1; i++) {
        //                //console.log(parseInt(_selectedRowsId[i], 10) +1 , parseInt(_selectedRowsId[i+1], 10));
        if (parseInt(_selectedRowsId[i], 10) + 1 != parseInt(_selectedRowsId[i + 1], 10)) {
            consecutive = false;
            break;
        }
    }
    if (consecutive) {
        $('#context_play').removeAttr("disabled").removeClass('ui-state-disabled');
    } else {
        $("#context_play").attr("disabled", "disabled").addClass('ui-state-disabled');
    }
    if (_selectedRowsId.length != 1) {
        console.log($("#context_edit").attr("disabled", "disabled"),
          $("#context_edit").addClass("ui-state-disabled"));
        //                $("#context_edit").attr("disabled","disabled");
        //                $("#context_edit").addClass("ui-state-disabled");
        //        console.log("length!=1", _selectedRowsId.length);
    } else {
        console.log($("#context_edit").removeAttr("disabled"),
          $("#context_edit").removeClass("ui-state-disabled"));
        //console.log("length==1", _selectedRowsId.length);
    }
    if (clipboard == null || clipboard.length == 0) {
        $("#context_paste").attr("disabled", "disabled").addClass("ui-state-disabled");
    } else {
        $("#context_paste").removeAttr("disabled").removeClass("ui-state-disabled");
    }
}
/*
 * New subtitle CKEDITOR ******************************************************************************************************************
 */
function initTextAreaDragable() {
    if (typeof CKEDITOR.instances['editorArea'] != "undefined") {
        try {
            CKEDITOR.instances.editorArea.destroy();
        } catch (e) {

        }
    }
    _subtitleEditor = CKEDITOR.replace('editorArea', {
        customConfig: '../js/hd/content/c.js',
        contentsCss: "../css/hd/css/stylish/c1.css",
        extraPlugins: 'onchange'
    });
    //    $("#editor").resizable().draggable().resize(onEditorResized);
    //    .mouseup(onEditorResized);
    CKEDITOR.on('instanceReady', function () {
        $("#editor").width($("#editor").width() + 1);
        setTimeout(onEditorResized, 100);
        //        CKEDITOR.instances.editorArea.execCommand('justifycenter');
        CKEDITOR.instances.editorArea.on('change', onEditorChanged);
        CKEDITOR.instances.editorArea.on('key', onEditorKeydown);
        //        var html='<span class="cke_toolgroup" role="presentation"><span class="cke_button"><a id="cke_88" class="cke_off cke_button_line_height" "="" href="javascript:void(\'\')" title="Line height" tabindex="-1" hidefocus="true" role="button" aria-labelledby="cke_18_label" onblur="showEditorLineHeight(this,false);" onclick="showEditorLineHeight(this,true); return false;"><span style="height:18px" class="cke_icon">&nbsp;</span><span id="cke_18_label" class="cke_label">Line height</span><span class="cke_buttonarrow">&nbsp;</span></a></span></span>';
        //        $(".custom-editor .cke_toolbar .cke_toolbar_end").remove();
        //        $(".custom-editor .cke_toolbar").append(html);
        //        $(".custom-editor .cke_toolbar").append('<span class="cke_toolbar_end"></span>');
    });
    $("#subtitlePreview").removeAttr("draggable")
    //  .draggable({
    //    stop:onPreviewDropped
    //  })
    //  .css("border","1px green solid")
    ;
    $("#hiddenArea").change(onHiddenAreaChanged);

}
function onPreviewDropped(event, ui) {
    var top = $("#subtitlePreview").css("top");
    var left = $("#subtitlePreview").css("left");
    subtitlePreview._userTop = parseInt(top) + $("#subtitlePreview").height();
    subtitlePreview._userLeft = parseInt(left) + ($("#subtitlePreview").width() / 2);
}
function parseSubstring() {
    var substring = "{\pos(830,988)}No, no, no, no, no!{\fnCourier\fs42\b0\i0}";
}
function getEditorData() {
    //    getSelected(document.getElementById("editorArea"))
    if (typeof _subtitleEditor != "undefined" && $("#subtitlePreview").text())
        return $("#subtitlePreview").text();
    return $("#subItemText").val();
}
function setEditorData(data) {
    var result = text2Html(data);
    if (typeof _subtitleEditor != "undefined") {
        _subtitleEditor.setData(result);
        $("#subtitlePreview").html(result);
    } else {
        $("#subItemText").val(result);
    }
}
function text2Html(text) {
    if (typeof _disConvertSubToHtml != "undefined" && _disConvertSubToHtml) {
        return text.trim("\n");
    }
    var tmp = text.split("\n");
    var result = "";
    for (var i = 0; i < tmp.length; i++) {
        if (tmp[i]) {
            result += "<p>" + tmp[i] + "</p>";
        }
    }
    return result;
}
var _sub_topDelta = 6.6;
var _sub_leftDelta = 28.2;
var _sub_marginBottom = 5;
function onEditorChanged() {
    if (_subtitleEditor.getData()) {
        $("#subtitlePreview").addClass("blackOpacity40");
        $("#subtitlePreview").css("display", "block");
        $("#subtitlePreview").html(_subtitleEditor.getData().trim());
        //        $("#hiddenArea span").each(function(i){
        //            $(this).parent().attr("style", $(this).attr("style")).html($(this).html());
        //        });
        $("#hiddenArea").trigger("change");
    } else {
        $("#subtitlePreview").css("display", "none");
    }
}
function onEditorResized() {
    if (_subtitleEditor) {
        _subtitleEditor.resize($("#editor").width() - 4, $("#editor").height() - 8);
    }
}
function onHiddenAreaChanged() {
    //    $(subtitlePreview).html($("#hiddenArea").html());
    if (typeof subtitlePreview._userTop != "undefined") {
        var top = subtitlePreview._userTop - $("#subtitlePreview").height();
        var left = subtitlePreview._userLeft - ($("#subtitlePreview").width() / 2);
        $("#subtitlePreview").css("top", top).css("left", left);
    } else {
        var width = $("#" + _playerId).width();
        var left = _sub_leftDelta + (width - $("#subtitlePreview").width()) / 2;
        var height = $("#" + _playerId).height();
        var top = height + _sub_topDelta - $("#subtitlePreview").height() - _sub_marginBottom;
        $("#subtitlePreview").css("top", top).css("left", left);
        subtitlePreview._userTop = top + $("#subtitlePreview").height();
        subtitlePreview._userLeft = left + ($("#subtitlePreview").width() / 2);
    }
}
function onEditorKeydown(e) {
    var event = e.data.domEvent.$;
    var keycode = event.keyCode || event.which;
    switch (keycode) {
        case arrow.insertTextBtn:
            if (event.ctrlKey) {
                $("#addItem").click();
                document.activeElement = document.getElementById("subTitleFormx");
            }
            break;
        default:
            break;
    }
}
function showEditorLineHeight(that, b) {
    console.log(that, b);
    var off = $(that).offset();
    if (b) {
        $(lineHeightSelect).css("left", off.left).css("top", off.top - $(that).height()).css("display", "block");
    } else {
        $(lineHeightSelect).css("left", off.left).css("top", off.top - $(that).height()).css("display", "none");
    }
}

/*
 * Control buttons action *********************************************************************************************************************************
 */
function fwdClick() {
    fwd = true;
    btClick = true;
    onFrame = hdplayer.paused();
    frameByFrame();
}

function prevClick() {
    fwd = false;
    btClick = true;
    onFrame = hdplayer.paused();
    frameByFrame();
}

function frameByFrame() {
    if (fwd) {
        hdplayer.setCurrentTime(hdplayer.getCurrentTime() + 0.040);
    }
    else {
        hdplayer.setCurrentTime(hdplayer.getCurrentTime() - 0.04);
    }
    _timeCurrent = hdplayer.getCurrentTime();
    hdplayer.buildCurrentProgress(_timeCurrent);
    _timeCurrent += _startOffset;
    var tmp = convertTimeToString(_timeCurrent);
    $(".mam_timeCount").val(convertTimeToString(_timeCurrent - _startTimeCounter + 0.04));
    $("#curentTime").text(tmp);
    $("input.curentTime").val(tmp);
    if (setFaster) {
        setFaster = false;
        setTimeout(faster, 300);
    }
}

function faster() {
    if (btClick) {
        $('#player_loading').css("display", "none");
        if (fwd) {
            hdplayer.rate(4);
            hdplayer.play();
        } else {
            hdplay();
            fastPrev(20);
        }
    }
}

function fastFwd() {
    if (btClick) {
        hdplayer.setCurrentTime(hdplayer.getCurrentTime() + 0.04);
        _timeCurrent = hdplayer.getCurrentTime();
        hdplayer.buildCurrentProgress(_timeCurrent);
        _timeCurrent += _startOffset;
        var tmp = convertTimeToString(_timeCurrent);
        $(".mam_timeCount").val(convertTimeToString(_timeCurrent - _startTimeCounter + 0.04));
        $("#curentTime").text(tmp);
        $("input.curentTime").val(tmp);
    }
}

function fastPrev(timeout) {
    if (btClick) {
        hdplayer.setCurrentTime(hdplayer.getCurrentTime() - 0.04);
        _timeCurrent = hdplayer.getCurrentTime();
        hdplayer.buildCurrentProgress(_timeCurrent);
        _timeCurrent += _startOffset;
        var tmp = convertTimeToString(_timeCurrent);
        $(".mam_timeCount").val(convertTimeToString(_timeCurrent - _startTimeCounter + 0.04));
        $("#curentTime").text(tmp);
        $("input.curentTime").val(tmp);
        setTimeout(fastPrev, timeout, timeout);
    }
}

function normalPlay() {
    hdplayer.rate(1);
    btClick = false;
    setFaster = true;
    _endTimeValue = _endOffset;
    playSub();
    $(".mejs-controls").removeClass("grabbing");
    $('#player_loading').css("display", "");
    if (onFrame) {
        hdstop();
    } else if (!fwd) {
        hdplay();
    }
}

function markIn() {
    _startTimeValue = hdplayer.getCurrentTime();
    _startTimeValue = _startTimeValue > 0 ? _startTimeValue : 0;
    $("#startTimeTrim").val(convertTimeToString(_startTimeValue + _startOffset));
    resetTimecount();
}

function markOut() {
    _endTimeValue = hdplayer.getCurrentTime();
    _endTimeValue = _endTimeValue + _startOffset < _endOffset ? _endTimeValue : _endOffset - _startOffset;
    $("#endTimeTrim").val(convertTimeToString(_endTimeValue + _startOffset));
}

function resetTimecount(time) {
    if (typeof time != "undefined") {
        _startTimeCounter = time;
    }
    else {
        _startTimeCounter = hdplayer.getCurrentTime() + _startOffset;
    }
    $(".mam_timeCount").val("00:00:00:00");
}

function playBack() {
    _startSubIndex = 0;
    _startSubBuffer = 0;
    min_current = 0;
    _startTimeValue = convertStringToTimeCode($("#startTimeTrim").val()) - _startOffset;
    _endTimeValue = convertStringToTimeCode($("#endTimeTrim").val()) - _startOffset;
    hdstop();
    var delay = _endTimeValue * 1000 - _startTimeValue * 1000;
    delay = delay < 40 ? 40 : delay;
    var _duration = _elementPlayer.duration;
    if (_startTimeValue > _duration || _endTimeValue > _duration) {
        alert("TimeCode out of range");
    } else if (_endTimeValue <= _startTimeValue) {
        alert("Timecode out must be larger timecode in");
    } else {
        hdplayer.setCurrentTime(_startTimeValue);
        setTimeout(checkPlaybackEnd, delay);
        hdplay();
        playSub();
    }
}

function playRows() {
    if (_selectedRowsId.length) {
        //        _startSubBuffer= _startSubIndex = parseInt(_selectedRowsId[0], 10)-1;
        var selectedRows = getCurrentSubItems();
        var startTime = getMinTimeCode(selectedRows);
        var endTime = getMaxTimeCode(selectedRows);

        $("#startTimeTrim").val(startTime);
        $("#endTimeTrim").val(endTime);
        playBack();
    }
}

function lastClick() {
    hdplayer.last();
}

function firstClick() {
    hdplayer.first();
}

function captureImage() {
    var currentFrame = _elementPlayer.currentTime;
    if (currentFrame != null && currentFrame) {
        currentFrame = convertTimeToString(currentFrame);
        $.ajax({
            type: "post",
            data: {
                "currentFrame": currentFrame
            },
            url: _basePath + "/mam/mam/captureFrame",
            success: function (data) {

            }
        });
    } else {
        alert("Seek to frame then try again");
    }
}

function captureTimecode() {
    var startTime = $("#startTimeTrim").val();
    var endTime = $("#endTimeTrim").val();
    if (startTime != null && startTime != ""
      && endTime != null && endTime != "" && endTime != "00:00:00.00") {
        $.ajax({
            type: "post",
            data: {
                "startTime": startTime,
                "endTime": endTime,
                "id": $(event.target).attr("data-id")
            },
            url: _basePath + "/mam/mam/captureTimecode",
            success: function (data) {
                if (data.status == 1) {
                    message("success", data.message);
                } else {
                    alert(data.message);
                }
            }
        });
    }
    else {
        alert("Mark in, out then try again");
    }
}
var m = "";

function checkPlaybackEnd() {
    if (hdplayer.getCurrentTime() <= _endTimeValue) {
        setTimeout(checkPlaybackEnd, 10);
    } else {
        hdplayer.pause();
    }
}
// get min and max time code in sub items array
function getMinTimeCode(subItems) {
    var minTime = _endOffset;
    var minTimeCode = convertTimeToString(_startOffset);
    if (subItems.length > 0) {
        for (var i = 0; i < subItems.length; i++) {
            if (minTime > subItems[i].startTimeFloat) {
                minTime = subItems[i].startTimeFloat;
                minTimeCode = subItems[i].startTime;
            }
        }
    }
    return minTimeCode;
}

function getMaxTimeCode(subItems) {
    var maxTime = _startOffset;
    var maxTimeCode = convertTimeToString(_endOffset);
    if (subItems.length > 0) {
        for (var i = 0; i < subItems.length; i++) {
            var tmp = convertStringToMs(subItems[i].endTime);
            if (maxTime < tmp) {
                maxTime = tmp;
                maxTimeCode = subItems[i].endTime;
            }
        }
    }
    return maxTimeCode;
}

function selectionSubByStartTime() {
    var startTimeFloat = getFormStartTimeFloat();
    $("#subtitleTable").resetSelection();
    if (startTimeFloat == 0) {
        var firstid = $("tr:first", "#subtitleTable").attr("id");
        $("#subtitleTable").setSelection(firstid, false);
    } else {
        var item = findSubitemByStartTime(startTimeFloat);
        if (item) {
            $("#subtitleTable").setSelection(item.itemId, false);
        } else {
            var lastid = $("tr:last", "#subtitleTable").attr("id");
            $("#subtitleTable").setSelection(lastid, false);
        }
    }
}

function selectionSubByEndTime() {
    var startTimeFloat = getFormEndTimeFloat();
    $("#subtitleTable").resetSelection();
    if (startTimeFloat == 0) {
        var firstid = $("tr:first", "#subtitleTable").attr("id");
        $("#subtitleTable").setSelection(firstid, false);
    } else {
        var item = findSubitemByStartTime(startTimeFloat);
        if (item) {
            $("#subtitleTable").setSelection(item.itemId, false);
        } else {
            var lastid = $("tr:last", "#subtitleTable").attr("id");
            $("#subtitleTable").setSelection(lastid, false);
        }
    }
}
/*
 * Sub play actions *********************************************************************************************************************************
 */

function convertStringToTimeCode(timeStr) {
    if (timeStr == null || timeStr == "") return 0;
    var time = 0;
    time += parseInt(timeStr.charAt(0) + timeStr.charAt(1)) * 3600;
    time += parseInt(timeStr.charAt(3) + timeStr.charAt(4)) * 60;
    time += parseInt(timeStr.charAt(6) + timeStr.charAt(7));
    time += parseFloat(timeStr.charAt(9) + timeStr.charAt(10)) * 40 / 1000;
    return parseFloat(time);
}

function playSub() {
    //console.log("playsub",_endTimeValue);
    if (_playSub) {
        if (!_endTimeValue) {
            _endTimeValue = _endOffset;
        }
        bufferCheckEvent(0);
    }
}

function removeSubItem() {
    $("#subtitlePreview").text("");
    $("#startTimeSubCur").text("");
    $("#endTimeSubCur").text("");
}

var _subStoped = false;

function bufferCheckEvent(startSubIndex) {

    var currentTime = hdplayer.getCurrentTime();
    if (currentTime <= _endTimeValue && _playSub) {
        startSubIndex = findStartSubIndex(startSubIndex);
        var buffer = loadBuffer(startSubIndex);

        var subItems = loadPlaySub(buffer);
        showSubItems(subItems);
        //    showMultipleSubItem(subItems);
        var delay = 0;
        var firstEvent = getFirstestEventTime(buffer);
        if (firstEvent >= 0 && !_elementPlayer.paused) {
            hdplayer.subPlayWaiting = true;
            delay = 40;
            setTimeout(bufferCheckEvent, delay, startSubIndex);
        } else {
            hdplayer.subPlayWaiting = false;
        }
        //        console.log("currentTime",currentTime,"startSubIndex",startSubIndex,
        //            "buffer", buffer,"firstEvent", firstEvent, "subItems", subItems,"delay", delay);
    }
}

var _bufferSize = 3;

function loadBuffer(startSubIndex) {
    var buffer = [];
    startSubIndex = startSubIndex ? startSubIndex : 0;
    if (startSubIndex >= 0) {
        var j = 0;
        for (var i = startSubIndex; i < _subItems.length && j < _bufferSize; i++, j++) {
            buffer.push(_subItems[i]);
        }
    }
    return buffer;
}

function getFirstestEventTime(buffer) {
    if (buffer.length > 0) {
        var current = hdplayer.getCurrentTime();
        var event = [];

        for (var i = 0; i < buffer.length; i++) {

            var tmp = buffer[i].startTimeFloat - _startOffset;
            //console.log("startTimeFloat", tmp, current);
            if (tmp >= current) {
                event.push(tmp);
            }
            tmp = convertStringToTimeCode(buffer[i].endTime) - _startOffset;
            if (tmp >= current) {
                event.push(tmp);
            }
        }
        for (var k = 0; k < event.length; k++) {
            for (var j = k + 1; j < event.length; j++) {
                if (event[k] > event[j]) {
                    var tmp1 = event[k];
                    event[k] = event[j];
                    event[j] = tmp1;
                }
            }
        }
        //console.log("event after short",event);
        return event[0];
    } else {
        return -1;
    }
}

function findStartSubIndex(currentIndex) {
    currentIndex = currentIndex ? currentIndex : 0;
    var currentTime = hdplayer.getCurrentTime();
    var start = true;
    var startSubIndex = 0;
    //    //console.log("findStartIndex");

    if (_subItems) {
        for (var i = currentIndex; i < _subItems.length; i++) {
            var subItem = _subItems[i];
            var s = subItem.startTimeFloat - _startOffset;
            var e = convertStringToTimeCode(subItem.endTime) - _startOffset;
            //console.log(currentIndex,"currentTime",currentTime,"s",s,"e",e);
            if (s <= currentTime && e >= currentTime) {
                if (start) {
                    start = false;
                    startSubIndex = i;
                    //                    //console.log("update startSubIndex", startSubIndex);
                    break;
                }
            }
            //            //console.log("start",start);
            if (s > currentTime && start) {
                startSubIndex = i;
                start = false;
                break;
            }
        }
        if (start) {
            startSubIndex = -1;
        }
        //console.log("startSubIndex",startSubIndex);

    }
    return startSubIndex;
}

function loadPlaySub(buffer) {
    var playSub = [];
    if (buffer.length > 0) {
        var currentTime = hdplayer.getCurrentTime();
        for (var i = 0; i < buffer.length; i++) {
            var subItem = buffer[i];
            var s = convertStringToTimeCode(subItem.startTime) - _startOffset;
            var e = convertStringToTimeCode(subItem.endTime) - _startOffset;
            //            //console.log(currentTime,s,e);
            if (s <= currentTime && e >= currentTime) {
                playSub.push(subItem);
            }
            if (s > currentTime) {
                break;
            }
        }
    }
    return playSub;
}
_toatMessages = {};

function showMultipleSubItem(subItems) {
    $("#subtitlePreview").css("display", "none");
    if (subItems != null && subItems.length > 0) {
        var events = [];
        $(".sub-item-preview").remove();
        for (var i = 0; i < subItems.length; i++) {
            if (subItems[i].type < 4) {
                var w = hdplayer.defaultOptions.subW + "px";
                var h = hdplayer.defaultOptions.subH + "px";
                var b = (400 - hdplayer.defaultOptions.subPY) + "px";
                var l = hdplayer.defaultOptions.subPX + "px";
                var html = "<div class='sub-item-preview' style='position:absolute;bottom:"
                + b + ";left:" + l + ";width:auto;height:" + h + "'>" +
                subItems[i].text.replace("\n", "<br/>") + "</div>";
                $(hdplayer.playerContent).append(html);
            } else if (subItems[i].type >= 4) {
                events.push(subItems[i]);
            }
        }
    }
}

function showSubItems(subItems) {
    var subToView = "";
    var line = 0;
    var events = [];
    var selectionIds = [];
    if (subItems != null && subItems.length > 0) {
        for (var i = 0; i < subItems.length; i++) {
            if (subItems[i].type < 4) {
                subToView += (i == 0 ? "" : "\n") + subItems[i].text;
            } else if (subItems[i].type >= 4) {
                events.push(subItems[i]);
            }
            selectionIds.push(subItems[i].itemId);
        }
        var subToEdit = subToView;
        line = countLine(1, subToView, 0);
        for (var j = 0; j < 4 - line; j++) {
            subToView = "\n" + subToView;
        }
    }
    //      console.log("subtoView",subToView);
    showSub(subToView, subToEdit);
    showEvents(events);
}

function showSub(subToView, subToEdit) {
    if (subToView) {
        $("#subtitlePreview").html(text2Html(subToView));
        $("#hiddenArea").trigger("change");
        $("#subtitlePreview").css("display", "block");
        $("#subtitlePreview").removeClass("blackOpacity40");
    } else {
        $("#subtitlePreview").css("display", "none");
    }
}

function showEvents(events) {
    var eventsId = [];
    for (var i = 0; i < events.length; i++) {
        if (typeof _toatMessages[events[i].itemId] == "undefined") {
            _toatMessages[events[i].itemId] = $().toastmessage('showToast', {
                text: typeof _secondaryEventType[events[i].text] != "undefined" ? _secondaryEventType[events[i].text] : events[i].text,
                sticky: true,
                position: 'top-left',
                type: "notice",
                stayTime: 0
            });
        }
        eventsId.push(events[i].itemId);
    }
    $.each(_toatMessages, function (i, v) {
        if (typeof v != "undefined" && $.inArray(i, eventsId) == -1) {
            $().toastmessage('removeToast', v);
            delete _toatMessages[i];
        }
    });
}

function countLine(line, String, index) {
    var m = String.indexOf("\n", index);
    if (m != -1) {
        line++;
        return countLine(line, String, m + 2);
    } else {
        return line;
    }
}


/*
 * Sub data actions *********************************************************************************************************************************
 */

function onSelectSub(rowid) {
    //console.log(rowid);
    _startSubIndex = rowid - 1;

    $("#startTimeTrim").val(_subItems[_startSubIndex].startTime);
    $("#endTimeTrim").val(_subItems[_startSubIndex].endTime);
    playBack();
}

function getFormStartTimeFloat() {
    var startTime = $("#startTimeTrim").val();
    return convertStringToTimeCode(startTime);
}

function getFormEndTimeFloat() {
    var endTime = $("#endTimeTrim").val();
    return convertStringToTimeCode(endTime);
}

function addSubItem() {
    if (notPermission) {
        alert("Permission denied");
    }
    else {
        disControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);

        var startTimeFloat = getFormStartTimeFloat();
        var startTime = convertTimeToStringDot(startTimeFloat);
        var endTimeFloat = getFormEndTimeFloat();
        var endTime = convertTimeToStringDot(endTimeFloat);
        var subText = getEditorData();
        subText = $.trim(subText);
        //console.log("subtext", subText);
        if (startTime && endTime && ((typeof _subTextAllowNull != "undefined" && _subTextAllowNull) || (subText && subText != ""))) {
            if (convertStringToTimeCode(endTime) > convertStringToTimeCode(startTime)) {
                var subItem = {
                    "itemId": hdplayer.defaultOptions.itemId--,
                    "startTimeFloat": startTimeFloat,
                    "startTime": startTime,
                    "endTime": endTime,
                    "text": subText,
                    "subtitleId": _subtitleId,
                    added: true,
                    type: hdplayer.addType
                };
                subtitleTable.p.userData.push(subItem);
                $("#subtitleTable").resetSelection();

                var item = findSubitemByStartTime(startTimeFloat);
                if (item) {
                    $("#subtitleTable").addRowData(subItem.itemId, subItem, 'after', item['itemId']);
                } else {
                    $("#subtitleTable").addRowData(subItem.itemId, subItem, 'last');
                }
                subtitleTable.p.userData = sortSubDataByIndex(subtitleTable.p.userData);
                $("#subtitleTable").setSelection(subItem.itemId, false);

                if (_sub_autoUpdateSubtitle) {
                    updateSubtitleData(function () {
                        enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
                        setEditorData("");
                    });
                } else {
                    setTimeout(function () {
                        enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
                        setEditorData("");
                    }, 100);
                }
            } else {
                alert("StartTime must be smaller EndTime");
                enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
            }

        } else {
            alert("StartTime, EndTime, Text, Index are required");
            enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
        }
    }
}

function editSubItem() {
    if (notPermission) {
        alert("Permission denied");
    } else {
        if (_selectedRowsId.length == 1) {
            var selectedItem = $("#subtitleTable").getSelectedItem();
            $("#startTimeTrim").val(selectedItem.startTime);
            $("#endTimeTrim").val(selectedItem.endTime);
            hdplayer.setCurrentTime(selectedItem.startTimeFloat - 0.5 - _startOffset);
            setEditorData(selectedItem.text);
            $("#ItemId").text(selectedItem.itemId);
            $("#addItem").val("UPDATE").removeClass("add_btn").addClass("update_btn");
            $("#addItem").unbind("click");
            $("#addItem").bind("click", function () {
                waitForFinalEvent(function () {
                    updateSubItem();
                }, 500, "some unique string");
            });
        }
    }
}

function deleteSubItem() {
    if (notPermission) {
        alert("Permission denied");
    } else {
        disControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
        var selectedRowsId = $("#subtitleTable").jqGrid('getGridParam', 'selarrrow');
        if (selectedRowsId.length > 0) {
            $("#subtitleTable").resetSelection();
            var data = subtitleTable.p.userData;
            for (var i = 0; i < selectedRowsId.length; i++) {
                if (typeof subtitleTable.p.lockCommentByUser != "undefined" && subtitleTable.p.lockCommentByUser) {
                    var x = $("#subtitleTable").getRowData(selectedRowsId[i]);
                    if (x.userId != null && x.userId != _currentUserId) {
                        continue;
                    }
                }
                $("#subtitleTable").delRowData(selectedRowsId[i]);
            }
            for (var i = 0; i < data.length; i++) {
                if (typeof subtitleTable.p.lockCommentByUser != "undefined" && subtitleTable.p.lockCommentByUser) {
                    var x = $("#subtitleTable").getRowData(selectedRowsId[i]);
                    if (x.userId != null && x.userId != _currentUserId) {
                        continue;
                    }
                }
                if (getSubtitleIndexById(data[i]['itemId']) === false) {
                    data.splice(i, 1);
                    i--;
                }
            }

            if (_sub_autoUpdateSubtitle) {
                updateSubtitleData(function () {
                    enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
                });
            } else {
                $("#advance_setting").trigger("changed");
                setTimeout(function () {
                    enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
                }, 100);
            }
        } else {
            alert("Chose item(s) to delete");
            enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"])
        }
    }
}

function _isUpdating() {
    //console.log($("#addItem").val()== "UPDATE");
    return $("#addItem").val() == "UPDATE";
}

function updateSubItem() {
    if (notPermission) {
        alert("Permission denied");
    } else {
        disControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
        if (_selectedRowsId.length == 1) {
            var startTimeFloat = getFormStartTimeFloat();
            var startTime = convertTimeToStringDot(startTimeFloat);
            var endTimeFloat = getFormEndTimeFloat();
            var endTime = convertTimeToStringDot(endTimeFloat);
            var subText = getEditorData();
            var selectedItem = $("#subtitleTable").getSelectedItem();

            selectedItem.updated = {};
            selectedItem.originStartTime = typeof selectedItem.originStartTime == "undefined"
            ? selectedItem.startTime : selectedItem.originStartTime;
            selectedItem.originEndTime = typeof selectedItem.originEndTime == "undefined"
            ? selectedItem.endTime : selectedItem.originEndTime;
            selectedItem.originText = typeof selectedItem.originText == "undefined"
            ? selectedItem.text : selectedItem.originText;

            if (selectedItem.originStartTime != startTime) {
                selectedItem.updated['startTime'] = startTime;
                selectedItem.updated['startTimeFloat'] = startTimeFloat;
            }
            if (selectedItem.originText != subText) {
                selectedItem.updated['text'] = subText;
            }
            if (selectedItem.originEndTime != endTime) {
                selectedItem.updated['endTime'] = endTime;
            }
            selectedItem.startTime = startTime;
            selectedItem.startTimeFloat = startTimeFloat;
            selectedItem.text = subText;
            selectedItem.endTime = endTime;

            $("#subtitleTable").setRowData(selectedItem.itemId, selectedItem);

            if (_sub_autoUpdateSubtitle) {
                updateSubtitleData(function () {
                    $("#addItem").val("ADD").addClass("add_btn").removeClass("update_btn");
                    $("#addItem").unbind("click");
                    $("#addItem").bind("click", function () {
                        addSubItem();
                    });
                    clearSubtitleInput();
                    enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
                });
            } else {
                setTimeout(function () {
                    $("#addItem").val("ADD").addClass("add_btn").removeClass("update_btn");
                    $("#addItem").unbind("click");
                    $("#addItem").bind("click", function () {
                        addSubItem();
                    });
                    clearSubtitleInput();
                    enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
                }, 100);
            }
        } else {
            alert("Chose one item to update");
            enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
        }
    }
}

function clearSubtitleInput() {
    $("#startTimeTrim").val("");
    $("#endTimeTrim").val("");
    $("#editorArea").val("");
    $("#ItemId").text(0);
    setEditorData("");
}

function cancelSub() {
    if (notPermission) {
        alert("Permission denied");
    } else {
        clearSubtitleInput();
        $("#addItem").val("ADD").addClass("add_btn").removeClass("update_btn");
        $("#addItem").unbind("click");
        $("#addItem").bind("click", function () {
            addSubItem();
        });
        enbControlButtons(["#addItem", "#playBackBtn", "#deleteItem"]);
    }
}

function findSubOrderIndex(startTimeValue) {
    var item = findSubitemByStartTime(startTimeValue);
    if (item) {
        return $("#subtitleTable").jqGrid('getInd', item['itemId']) - 1;
    }
    return typeof _subItems != "undefined" && _subItems ? _subItems.length : 0;
}

function findSubitemByStartTime(startTimeValue) {
    if (typeof subtitleTable == "undefined") return 0;
    _subItems = subtitleTable.p.userData;
    for (var index = 0; index < _subItems.length; index++) {
        if (_subItems[index].startTimeFloat < startTimeValue) {
            continue;
        } else if (index > 0) {
            return _subItems[index - 1];
        }
    }
    return null;
}

function reIndexing(subItems, Index) {
    //console.log(subItems, Index);
    if (typeof subItems != "undefined" && subItems.length) {
        for (var index = Index - 1; index < subItems.length; index++) {
            subItems[index].subIndex = index + 1;
            if (subItems[index].startTimeFloat === null) {
                subItems[index].startTimeFloat = convertStringToMs(subItems[index].startTime);
            }
        }
    }
    return subItems;
}

function sortSubDataByIndex(subData) {
    var result = [];
    for (var i = 0; i < subData.length; i++) {
        var index = getSubtitleIndexById(subData[i]['itemId']);
        result[index - 1] = subData[i];
    }
    return result;
}

var file;


function getSelected(e) {
    var ss = e.selectionStart;
    var se = e.selectionEnd;
    var selected = "";
    var value = e.value;
    if (typeof ss === "number" && typeof se === "number") {
        selected = e.value.substring(ss, se);
        createSelection(ss, se, e);
    }
    //    //console.log(selected,value);
    return selected != "" ? selected : value;
}
function createSelection(start, end, field) {

    if (field.createTextRange) {

        /*
            IE calculates the end of selection range based
            from the starting point.
            Other browsers will calculate end of selection from
            the beginning of given text node.
         */

        var newend = end - start;
        var selRange = field.createTextRange();
        selRange.collapse(true);
        selRange.moveStart("character", start);
        selRange.moveEnd("character", newend);
        selRange.select();
    }

        /* For the other browsers */

    else if (field.setSelectionRange) {

        field.setSelectionRange(start, end);
    }

    field.focus();
}
document._dialog = null;

//$("#commentDisabled").livequery(function () {
//    notPermission = $("#commentDisabled").text() != "1";
//    if (notPermission) {
//        $("#editorArea").attr("disabled", "disabled");
//    }
//});

function removeScroll(e) {
    var width = $(window).width();
    var height = $(window).height();
    //console.log(width,height,$(e).width(), $(e).height());
    if ($(e).width() < width && $(e).height() < height) {
        $('body').css("overflow", "hidden");
        $(window).resize();
    }
}
var _selectedRowId;
function open_in_new_tab(url) {
    //console.log(url);
    window.open(url, '_blank');
    window.focus();
}

function initVisualizer() {
    if (typeof _allowInitVisualizer != 'undefined' && _allowInitVisualizer) {
        if (typeof AudioVisualation != "undefined") {
            var
            canvas = document.getElementById('fft')
            , meter = $("#meter").get(0)
            , audio = document.getElementById(_playerId)
            ;
            var options = {
                audio: audio,
                canvas: canvas,
                meter: meter,
                vuDisabled: _playerOptions['hiddenVuMeter'],
                drumDisabled: _playerOptions['hiddenSpectrum']
            };
            hdplayer.audioVisual = Object.create(AudioVisualation);
            hdplayer.audioVisual.AudioVisualation(options);
            if (!hdplayer.audioVisual.initSuccess) {
                $("#enabledVuMeter").attr("checked", false);
                $("#enabledVuMeter").attr("disabled", "disabled");
                $("#enabledSpectrum").attr("checked", false);
                $("#enabledSpectrum").attr("disabled", "disabled");
            }
            checkEnabledVu($("#enabledVuMeter"));
        }
    } else {
        $(".vu_meter").addClass("hidden");
    }
}

/*
 * Grid action: refresh, update
 */

function refreshSubtitleGrid(data) {
    data = typeof data == "object" && typeof data.length != "undefined" ? data : subtitleTable.p.userData;
    $("#subtitleTable").jqGrid('clearGridData')
    .jqGrid('setGridParam', {
        datatype: "local",
        localReader: {
            repeatitems: false,
            id: 'itemId'
        },
        sortname: 'startTimeFloat',
        sortorder: "asc",
        data: data
    })
    .trigger('reloadGrid')
    .jqGrid('setGridParam', {
        datatype: "json"
    })
    ;
}

function updateSubtitleData(success) {
    var data = subtitleTable.p.userData;
    var updated = [];
    var inserted = [];
    for (var i = 0; i < data.length; i++) {
        if (typeof data[i]['added'] != "undefined") {
            inserted.push(data[i]);
        } else if (typeof data[i]['updated'] == "object" && data[i]['updated']) {
            data[i]['updated']['itemId'] = data[i]['itemId'];
            updated.push(data[i]['updated']);
        }
    }
    var a = $.extend({}, $(subtitleTable).jqGrid('getGridParam', 'postData'));
    a.rows = 10000;
    a.page = 1;
    $.ajax({
        url: subtitleTable.p.url + "&" + $.param(a),
        type: "post",
        data: $.extend({
            updated: updated,
            inserted: inserted,
            subtitleId: _subtitleId,
            dataIds: $("#subtitleTable").getDataIDs()
        }, a),
        success: function (data) {
            if (typeof data['userData'] != "undefined") {
                subtitleTable.p.userData = data.userData;
                _subItems = data.userData;
                _allSubItems = _subItems;
                $("#advance_setting").trigger("changed");
                if (typeof success == "function") {
                    success();
                }
            } else {
                console.log(data);
            }
        }
    });
}

function initSubtitleContext() {
    $("#subtitleTable").contextMenu('myContextMenu', {
        bindings: {
            'context_play': function (trigger) {
                // trigger is the DOM element ("tr.jqgrow") which are triggered
                if (!$("#context_play").attr("disabled") || !$("#context_play").attr("disabled") == "disabled") {
                    playRows();
                }
            },
            'context_edit': function (trigger) {
                if (!$("#context_edit").attr("disabled") || !$("#context_edit").attr("disabled") == "disabled") {
                    editSubItem();
                }
                //                grid.editGridRow("new", addSettings);
            },
            'context_delete': function (trigger) {
                deleteSubItem();
            },
            'context_clearMark': function (trigger) {
                $("#subtitleTable").resetSelection();
            },
            'context_move_top': function (trigger) {
                // trigger is the DOM element ("tr.jqgrow") which are triggered
                if (!$("#context_move_top").attr("disabled") || !$("#context_move_top").attr("disabled") == "disabled") {
                    subMoveTop();
                }
            },
            'context_move_up': function (trigger) {
                // trigger is the DOM element ("tr.jqgrow") which are triggered
                if (!$("#context_move_up").attr("disabled") || !$("#context_move_up").attr("disabled") == "disabled") {
                    subMoveUp();
                }
            },
            'context_move_down': function (trigger) {
                // trigger is the DOM element ("tr.jqgrow") which are triggered
                if (!$("#context_move_down").attr("disabled") || !$("#context_move_down").attr("disabled") == "disabled") {
                    subMoveDown();
                }
            },
            'context_move_bottom': function (trigger) {
                // trigger is the DOM element ("tr.jqgrow") which are triggered
                if (!$("#context_move_bottom").attr("disabled") || !$("#context_move_bottom").attr("disabled") == "disabled") {
                    subMoveBottom();
                }
            },
            'context_cut': function (trigger) {
                // trigger is the DOM element ("tr.jqgrow") which are triggered
                if (!$("#context_cut").attr("disabled") || !$("#context_cut").attr("disabled") == "disabled") {
                    cut();
                    $(subtitleTable).resetSelection();
                }
            },
            'context_paste': function (trigger) {
                // trigger is the DOM element ("tr.jqgrow") which are triggered
                if (!$("#context_paste").attr("disabled") || !$("#context_paste").attr("disabled") == "disabled") {
                    var selected = getCurrentSubItems();
                    if (selected) {
                        var i = selected[0].subIndex - 1;
                        paste(i);
                    }
                }
            },
            'context_addEvent': function (trigger) {
                $("#addEvent_dialog").dialog("open");
                var obj = $("#addEvent_dialog").serializeObject();
                obj.tcIn = $("#subTitleFormx #startTimeTrim").val();
                obj.tcOut = $("#subTitleFormx #endTimeTrim").val();
                $("#addEvent_dialog form").parseObject(obj);
            }
        },
        onContextMenu: function (event/*, menu*/) {
            var isUpdating = _isUpdating();
            //console.log(isUpdating);
            if (isUpdating) {
                alert("Complete edit event to continue");
                event.preventDefault();
            } else {
                setTimeout(onContextMenu, 50, event);
                return true;
            }
        }
    });
}

/*
 * Move
 *
 */
function getCurrentSubItems() {
    return $("#subtitleTable").getSelectedItems();
}

function copy() {
    clipboard = getCurrentSubItems();
}

function paste(pasteTo) {
    if (typeof clipboard != "object" || clipboard == null) {
        alert(_translator.translate("There is no data in the clipboard!"));
        return;
    }

    var selrow = $("#subtitleTable").jqGrid('getGridParam', 'selrow');
    if (selrow == null && typeof pasteTo == "undefined")
        return null;
    var dataIds = $("#subtitleTable").getDataIDs();
    var index = typeof pasteTo !== "undefined" ? pasteTo : $.inArray(selrow, dataIds);
    if (index < 0)
        index = -1;
    for (var i = 0; i < subtitleTable.p.userData.length; i++) {
        var tmp = subtitleTable.p.userData[i];
        if (tmp.subIndex - 1 == index && index >= 0) {
            index = i;
        }
        tmp.subIndex = i + 1;
        subtitleTable.p.userData.splice(i, 1, tmp);
    }
    var selarrrow = [];
    for (var i = 0; i < clipboard.length; i++) {
        var entity = $.extend(true, {}, clipboard[i]);
        $("#subtitleTable").get(0).p.userData.splice(index + i + 1, 0, entity);
    }
    for (var i = 0; i < subtitleTable.p.userData.length; i++) {
        var tmp = subtitleTable.p.userData[i];
        tmp.subIndex = i + 1;
        if ($.inArray(tmp.itemId, selectedIDs) != -1) {
            selarrrow.push(tmp.subIndex);
        }
        subtitleTable.p.userData.splice(i, 1, tmp);
    }
    selectedIDs = [];
    setTimeout(function () {
        for (var i = 0; i < selarrrow.length; i++) {
            $("#subtitleTable").setSelection(selarrrow[i], true);
        }
    }, 2);
    refreshSubtitleGrid();
    $("#subtitleTable").jqGrid('setGridParam', 'selarrrow', selarrrow);
}

var selectedIDs = [];

function cut() {
    clipboard = getCurrentSubItems();
    var selarrrow = $("#subtitleTable").jqGrid('getGridParam', 'selarrrow');
    var dataIds = $("#subtitleTable").getDataIDs();
    var minIndex = -1;
    var maxIndex = 0;
    for (var i in selarrrow) {
        var selrow = selarrrow[i];
        var index = $.inArray(selrow, dataIds);
        if (index >= 0) {
            minIndex = minIndex < 0 ? index : (minIndex >= index ? index : minIndex);
            maxIndex = maxIndex <= index ? index : maxIndex;
            $("#subtitleTable").get(0).p.userData.splice(index, 1);
            dataIds.splice(index, 1);
        }
    }
    selectedIDs = [];
    for (var i = 0; i < clipboard.length; i++) {
        selectedIDs.push(clipboard[i].itemId);
    }

    var result = {
        'min': minIndex,
        'max': maxIndex
    };
    return result;
}

function subMoveTop() {
    cut();
    paste(-1);
    clipboard = [];
}

function subMoveUp() {
    var result = cut();
    var index = result.min;
    paste(index - 2);
    clipboard = [];
}

function subMoveDown() {
    var result = cut();
    var index = result.max;
    paste(index);
    clipboard = [];
}

function subMoveBottom() {
    cut();
    var index = $("#subtitleTable").get(0).p.userData.length;
    paste(index);
    clipboard = [];
}

function subtitleIndexFormat(cellvalue, options, rowObject) {
    rowObject.subIndex = subtitleTable.currentIndex++;
    return rowObject.subIndex;
}

function subtitleGridBeforeProcessing(data, status, xhr) {
    subtitleTable.currentIndex = 1;
}

function getSubtitleIndexById(id) {
    return $("#subtitleTable").jqGrid('getInd', id);
}

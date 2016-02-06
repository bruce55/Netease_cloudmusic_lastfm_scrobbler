﻿(function () {
    var insertElement = document.createElement("div");
    insertElement.innerHTML = "<table class=\"m-center\"><tbody><tr><td><div class=\"u-result centeritem j-tips\" stype=\"padding: 25px;\"><i class=\"icon true\"></i><span class=\"u-tit f-ff2\">脚本注入成功</span></div></td></tr></tbody></table>";
    document.querySelector("body").appendChild(insertElement.firstChild);
    setTimeout(function () {
        document.querySelector("body").removeChild(document.querySelector(".m-center"));
    }, 10000);
    //Configure your session info manually here
    var apiInfo = {
        baseurl: "http://ws.audioscrobbler.com/2.0/",
        api_key: "81a380cb10147c1945f018e65950f379",
        secret: "3a34f3ad0dbce62de7989abf41a5973b",
        token: "",
        session_key: ""
    };

    //Scrobbler settings. Default: when the progress bar goes over 50 percent, or when the play time exceeds 4 minutes.
    var scrobbleProgress = 50, //percent
        scrobbleTime = 4;      //minutes

    var scrobblerStatus = {
        logged: true,
        logging: false,
        ready: false,
        love: false,
        scrobble: {
            artist: "",
            track: "",
            timestamp: Math.floor(Date.now() / 1000),
            duration: 0,
            album: ""
        }
    };

    var targetSong = document.querySelector("div.m-pinfo > div");

    function getAlbum(id, cb) {
        if (id.length == 40) {
            cb(null, null);
        } else {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    var response = JSON.parse(request.responseText);
                    cb(response.songs[0].album.name, Math.floor(response.songs[0].duration / 1000));
                }
            }
            var url = "http://music.163.com/api/song/detail/?id=" + id + "&ids=%5B" + id + "%5D";
            request.open("GET", url, true);
            request.send();
        }
    }

    if (targetSong.childNodes[3]) {
        scrobblerStatus.scrobble.track = targetSong.childNodes[3].firstChild.firstChild.nodeValue.replace(/\u00a0/g, " ");
        scrobblerStatus.scrobble.artist = targetSong.childNodes[5].childNodes[1].firstChild.nodeValue.replace(/\u00a0/g, " ");
        var id = targetSong.childNodes[7].getAttribute("data-res-id");
        if (id) {
            getAlbum(id, function (album, duration) {
                scrobblerStatus.scrobble.album = album;
                scrobblerStatus.scrobble.duration = duration;
                scrobblerStatus.ready = true;
            });
        }
    }

    function getSig(params) {
        function calcMd5(str) {
            /*
             * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
             * Digest Algorithm, as defined in RFC 1321.
             * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
             * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
             * Distributed under the BSD License
             * See http://pajhome.org.uk/crypt/md5 for more info.
             */

            /*
             * Configurable variables. You may need to tweak these to be compatible with
             * the server-side, but the defaults work in most cases.
             */
            var hexcase = 0;   /* hex output format. 0 - lowercase; 1 - uppercase        */
            var b64pad = "";  /* base-64 pad character. "=" for strict RFC compliance   */

            /*
             * These are the functions you'll usually want to call
             * They take string arguments and return either hex or base-64 encoded strings
             */
            function hex_md5(s) { return rstr2hex(rstr_md5(str2rstr_utf8(s))); }
            function b64_md5(s) { return rstr2b64(rstr_md5(str2rstr_utf8(s))); }
            function any_md5(s, e) { return rstr2any(rstr_md5(str2rstr_utf8(s)), e); }
            function hex_hmac_md5(k, d)
            { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
            function b64_hmac_md5(k, d)
            { return rstr2b64(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))); }
            function any_hmac_md5(k, d, e)
            { return rstr2any(rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d)), e); }

            /*
             * Perform a simple self-test to see if the VM is working
             */
            function md5_vm_test() {
                return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72";
            }

            /*
             * Calculate the MD5 of a raw string
             */
            function rstr_md5(s) {
                return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
            }

            /*
             * Calculate the HMAC-MD5, of a key and some data (raw strings)
             */
            function rstr_hmac_md5(key, data) {
                var bkey = rstr2binl(key);
                if (bkey.length > 16) bkey = binl_md5(bkey, key.length * 8);

                var ipad = Array(16), opad = Array(16);
                for (var i = 0; i < 16; i++) {
                    ipad[i] = bkey[i] ^ 0x36363636;
                    opad[i] = bkey[i] ^ 0x5C5C5C5C;
                }

                var hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
                return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
            }

            /*
             * Convert a raw string to a hex string
             */
            function rstr2hex(input) {
                try { hexcase } catch (e) { hexcase = 0; }
                var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
                var output = "";
                var x;
                for (var i = 0; i < input.length; i++) {
                    x = input.charCodeAt(i);
                    output += hex_tab.charAt((x >>> 4) & 0x0F)
                        + hex_tab.charAt(x & 0x0F);
                }
                return output;
            }

            /*
             * Convert a raw string to a base-64 string
             */
            function rstr2b64(input) {
                try { b64pad } catch (e) { b64pad = ""; }
                var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                var output = "";
                var len = input.length;
                for (var i = 0; i < len; i += 3) {
                    var triplet = (input.charCodeAt(i) << 16)
                        | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0)
                        | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
                    for (var j = 0; j < 4; j++) {
                        if (i * 8 + j * 6 > input.length * 8) output += b64pad;
                        else output += tab.charAt((triplet >>> 6 * (3 - j)) & 0x3F);
                    }
                }
                return output;
            }

            /*
             * Convert a raw string to an arbitrary string encoding
             */
            function rstr2any(input, encoding) {
                var divisor = encoding.length;
                var i, j, q, x, quotient;

                /* Convert to an array of 16-bit big-endian values, forming the dividend */
                var dividend = Array(Math.ceil(input.length / 2));
                for (i = 0; i < dividend.length; i++) {
                    dividend[i] = (input.charCodeAt(i * 2) << 8) | input.charCodeAt(i * 2 + 1);
                }

                /*
                 * Repeatedly perform a long division. The binary array forms the dividend,
                 * the length of the encoding is the divisor. Once computed, the quotient
                 * forms the dividend for the next step. All remainders are stored for later
                 * use.
                 */
                var full_length = Math.ceil(input.length * 8 /
                (Math.log(encoding.length) / Math.log(2)));
                var remainders = Array(full_length);
                for (j = 0; j < full_length; j++) {
                    quotient = Array();
                    x = 0;
                    for (i = 0; i < dividend.length; i++) {
                        x = (x << 16) + dividend[i];
                        q = Math.floor(x / divisor);
                        x -= q * divisor;
                        if (quotient.length > 0 || q > 0)
                            quotient[quotient.length] = q;
                    }
                    remainders[j] = x;
                    dividend = quotient;
                }

                /* Convert the remainders to the output string */
                var output = "";
                for (i = remainders.length - 1; i >= 0; i--)
                    output += encoding.charAt(remainders[i]);

                return output;
            }

            /*
             * Encode a string as utf-8.
             * For efficiency, this assumes the input is valid utf-16.
             */
            function str2rstr_utf8(input) {
                var output = "";
                var i = -1;
                var x, y;

                while (++i < input.length) {
                    /* Decode utf-16 surrogate pairs */
                    x = input.charCodeAt(i);
                    y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
                    if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
                        x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
                        i++;
                    }

                    /* Encode output as utf-8 */
                    if (x <= 0x7F)
                        output += String.fromCharCode(x);
                    else if (x <= 0x7FF)
                        output += String.fromCharCode(0xC0 | ((x >>> 6) & 0x1F),
                            0x80 | (x & 0x3F));
                    else if (x <= 0xFFFF)
                        output += String.fromCharCode(0xE0 | ((x >>> 12) & 0x0F),
                            0x80 | ((x >>> 6) & 0x3F),
                            0x80 | (x & 0x3F));
                    else if (x <= 0x1FFFFF)
                        output += String.fromCharCode(0xF0 | ((x >>> 18) & 0x07),
                            0x80 | ((x >>> 12) & 0x3F),
                            0x80 | ((x >>> 6) & 0x3F),
                            0x80 | (x & 0x3F));
                }
                return output;
            }

            /*
             * Encode a string as utf-16
             */
            function str2rstr_utf16le(input) {
                var output = "";
                for (var i = 0; i < input.length; i++)
                    output += String.fromCharCode(input.charCodeAt(i) & 0xFF,
                    (input.charCodeAt(i) >>> 8) & 0xFF);
                return output;
            }

            function str2rstr_utf16be(input) {
                var output = "";
                for (var i = 0; i < input.length; i++)
                    output += String.fromCharCode((input.charCodeAt(i) >>> 8) & 0xFF,
                        input.charCodeAt(i) & 0xFF);
                return output;
            }

            /*
             * Convert a raw string to an array of little-endian words
             * Characters >255 have their high-byte silently ignored.
             */
            function rstr2binl(input) {
                var output = Array(input.length >> 2);
                for (var i = 0; i < output.length; i++)
                    output[i] = 0;
                for (var i = 0; i < input.length * 8; i += 8)
                    output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
                return output;
            }

            /*
             * Convert an array of little-endian words to a string
             */
            function binl2rstr(input) {
                var output = "";
                for (var i = 0; i < input.length * 32; i += 8)
                    output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
                return output;
            }

            /*
             * Calculate the MD5 of an array of little-endian words, and a bit length.
             */
            function binl_md5(x, len) {
                /* append padding */
                x[len >> 5] |= 0x80 << ((len) % 32);
                x[(((len + 64) >>> 9) << 4) + 14] = len;

                var a = 1732584193;
                var b = -271733879;
                var c = -1732584194;
                var d = 271733878;

                for (var i = 0; i < x.length; i += 16) {
                    var olda = a;
                    var oldb = b;
                    var oldc = c;
                    var oldd = d;

                    a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
                    d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
                    c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
                    b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
                    a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
                    d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
                    c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
                    b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
                    a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
                    d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
                    c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
                    b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
                    a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
                    d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
                    c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
                    b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

                    a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
                    d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
                    c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
                    b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
                    a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
                    d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
                    c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
                    b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
                    a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
                    d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
                    c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
                    b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
                    a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
                    d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
                    c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
                    b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

                    a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
                    d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
                    c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
                    b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
                    a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
                    d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
                    c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
                    b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
                    a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
                    d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
                    c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
                    b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
                    a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
                    d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
                    c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
                    b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

                    a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
                    d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
                    c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
                    b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
                    a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
                    d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
                    c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
                    b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
                    a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
                    d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
                    c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
                    b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
                    a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
                    d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
                    c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
                    b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

                    a = safe_add(a, olda);
                    b = safe_add(b, oldb);
                    c = safe_add(c, oldc);
                    d = safe_add(d, oldd);
                }
                return Array(a, b, c, d);
            }

            /*
             * These functions implement the four basic operations the algorithm uses.
             */
            function md5_cmn(q, a, b, x, s, t) {
                return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
            }
            function md5_ff(a, b, c, d, x, s, t) {
                return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
            }
            function md5_gg(a, b, c, d, x, s, t) {
                return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
            }
            function md5_hh(a, b, c, d, x, s, t) {
                return md5_cmn(b ^ c ^ d, a, b, x, s, t);
            }
            function md5_ii(a, b, c, d, x, s, t) {
                return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
            }

            /*
             * Add integers, wrapping at 2^32. This uses 16-bit operations internally
             * to work around bugs in some JS interpreters.
             */
            function safe_add(x, y) {
                var lsw = (x & 0xFFFF) + (y & 0xFFFF);
                var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
                return (msw << 16) | (lsw & 0xFFFF);
            }

            /*
             * Bitwise rotate a 32-bit number to the left.
             */
            function bit_rol(num, cnt) {
                return (num << cnt) | (num >>> (32 - cnt));
            }

            return hex_md5(str);
        }

        var keys = [];
        for (var key in params) {
            if (params.hasOwnProperty(key) && params[key]) {
                keys.push(key + params[key]);
            }
        }
        keys.sort();
        var sig = keys.join("") + apiInfo.secret;
        console.log("Generated api_sig:", sig);
        var sigHashed = calcMd5(sig);
        return sigHashed;
    }

    function paramsEncode(params, sig) {
        var data = "";
        for (var key in params) {
            if (params.hasOwnProperty(key) && params[key]) {
                data += encodeURIComponent(key) + "=" + encodeURIComponent(params[key]) + "&";
            }
        }
        data += "api_sig=" + sig;
        return data;
    }

    function postRequest(params, cb) {
        var url = apiInfo.baseurl + "?format=json";
        var request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                cb(request);
            }
        }
        var sig = getSig(params);
        var data = paramsEncode(params, sig);
        request.open("POST", url, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(data);
    }

    var observerSong = new MutationObserver(function (mutations) {
        scrobblerStatus = {
            logged: false,
            logging: false,
            ready: false,
            love: false,
            scrobble: {
                artist: "",
                track: "",
                timestamp: Math.floor(Date.now() / 1000),
                duration: 0,
                album: ""
            }
        };
        mutations.forEach(function (mutation) {
            scrobblerStatus.scrobble.track = mutation.addedNodes[3].firstChild.firstChild.nodeValue.replace(/\u00a0/g, " ");
            scrobblerStatus.scrobble.artist = mutation.addedNodes[5].childNodes[1].firstChild.nodeValue.replace(/\u00a0/g, " ");
            var id = mutation.addedNodes[7].getAttribute("data-res-id");
            getAlbum(id, function (album, duration) {
                scrobblerStatus.scrobble.album = album;
                scrobblerStatus.scrobble.duration = duration;
                scrobblerStatus.logging = true;
                var method = "track.updateNowPlaying";

                var params = {
                    'album': scrobblerStatus.scrobble.album,
                    'api_key': apiInfo.api_key,
                    'artist': scrobblerStatus.scrobble.artist,
                    'duration': scrobblerStatus.scrobble.duration,
                    'method': method,
                    'sk': apiInfo.session_key,
                    'track': scrobblerStatus.scrobble.track
                }
                postRequest(params, function (request) {
                    scrobblerStatus.logging = false;
                    console.log("Request response:\n" + JSON.stringify(JSON.parse(request.responseText), null, "\t"));
                });

                scrobblerStatus.ready = true;
            });
        });
    });
    observerSong.observe(targetSong, { childList: true });

    // FM Mode or not
    if(document.querySelector(".m-player-fm").childNodes[1].getAttribute("data-action") == "pause") {
        var targetPrg = document.querySelector(".m-player-fm > .prg > .has");
        var targetPlaytime = document.querySelector(".m-player-fm > time.now");
    } else {
        var targetPrg = document.querySelector(".prg > .has");
        var targetPlaytime = document.querySelector("time.now");
    }

    function logResponse(request) {
        console.log("Request response:\n" + JSON.stringify(JSON.parse(request.responseText), null, "\t"));
    }

    var observerPrg = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var prg = targetPrg.getAttribute("style").slice(7, -2);
            var playtime = targetPlaytime.innerText.match(/\d*(?=:)/)[0];
            if (scrobblerStatus.ready && !scrobblerStatus.logging) {
                var method;
                if ((prg > scrobbleProgress || playtime >= scrobbleTime) && !scrobblerStatus.logged) {
                    scrobblerStatus.logging = true;
                    method = "track.scrobble";
                    var params = {
                        'album': scrobblerStatus.scrobble.album,
                        'api_key': apiInfo.api_key,
                        'artist': scrobblerStatus.scrobble.artist,
                        'duration': scrobblerStatus.scrobble.duration,
                        'method': method,
                        'sk': apiInfo.session_key,
                        'timestamp': scrobblerStatus.scrobble.timestamp,
                        'track': scrobblerStatus.scrobble.track
                    }
                    postRequest(params, function (request) {
                        scrobblerStatus.logged = true;
                        scrobblerStatus.logging = false;
                        console.log("Request response:\n" + JSON.stringify(JSON.parse(request.responseText), null, "\t"));
                    });
                }
                var targetLove = document.querySelector("div.m-pinfo > div > span");
                if ((!scrobblerStatus.love && targetLove.classList.contains("z-show1")) || (scrobblerStatus.love && !targetLove.classList.contains("z-show1"))) {
                    if (scrobblerStatus.love) {
                        scrobblerStatus.love = false;
                        method = "track.unlove";
                    } else {
                        scrobblerStatus.love = true;
                        method = "track.love";
                    }
                    var paramsLove = {
                        'api_key': apiInfo.api_key,
                        'artist': scrobblerStatus.scrobble.artist,
                        'method': method,
                        'sk': apiInfo.session_key,
                        'track': scrobblerStatus.scrobble.track
                    };
                    postRequest(paramsLove, logResponse);
                }
            }
        });
    });
    observerPrg.observe(targetPrg, { attributes: true });
})();
(function () {
    var scrobbler_status = {
        logged: false,
        ready: false,
        scrobble: {
            artist: '',
            track: '',
            timestamp: '',
            album: ''
        }
    }
    var target_song = document.querySelector('div.m-pinfo > div');
    scrobbler_status.scrobble.track = target_song.childNodes[3].firstChild.firstChild.nodeValue;
    scrobbler_status.scrobble.artist = target_song.childNodes[5].childNodes[1].firstChild.nodeValue;
    var id = target_song.childNodes[9].getAttribute('data-res-id');
    getAlbum(id, function (album) {
        scrobbler_status.scrobble.album = album;
        scrobbler_status.ready = true;
    })
    var observer_song = new MutationObserver(function (mutations) {
        scrobbler_status = {
            logged: false,
            ready: false,
            scrobble: {
                artist: '',
                track: '',
                timestamp: '',
                album: ''
            }
        };
        mutations.forEach(function (mutation) {
            scrobbler_status.scrobble.track = mutation.addedNodes[3].firstChild.firstChild.nodeValue;
            scrobbler_status.scrobble.artist = mutation.addedNodes[5].childNodes[1].firstChild.nodeValue;
            var id = mutation.addedNodes[9].getAttribute('data-res-id');
            getAlbum(id, function(album) {
                scrobbler_status.scrobble.album = album;
                scrobbler_status.ready = true;
            })
        });
    });
    observer_song.observe(target_song, { childList: true });
    function getAlbum(id, cb) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                var ablum = request.responseText.match(/所属专辑.+"s-fc7">(.+?)</)[1];
                cb(ablum);
            }
        }
        var url = 'http://music.163.com/song?id=' + id;
        request.open('GET', url, true);
        request.send();
    }

    var target_prg = document.querySelector('.prg > .has');
    var observer_prg = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var prg = target_prg.getAttribute('style').slice(7, -2);
            if (prg > 50 && !scrobbler_status.logged && scrobbler_status.ready) {

                //TODO

                scrobbler_status.logged = true;
            }
            console.log(scrobbler_status, scrobbler_status.scrobble);
        })
    });
    observer_prg.observe(target_prg, { attributes: true });
})();
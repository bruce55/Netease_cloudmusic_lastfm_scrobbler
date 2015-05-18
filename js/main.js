(function () {
    var scrobbler_status = {
        loggable: false,
        logged: false,
        scrobble: {
            artist: '',
            track: '',
            timestamp: '',
            album: ''
        }
    }
    var target = document.querySelector('div.m-pinfo > div');
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            scrobbler_status.scrobble.track = mutation.addedNodes[3].firstChild.firstChild.nodeValue;
            scrobbler_status.scrobble.artist = mutation.addedNodes[5].childNodes[1].firstChild.nodeValue;
            var id = mutation.addedNodes[9].getAttribute('data-res-id');
            //from 163_music_scrobbler
            
            getAlbum(id, function(album) {
                scrobbler_status.scrobble.album = album;
                console.log(scrobbler_status.scrobble);
            })

        });
    });
    var config = { childList: true };
    observer.observe(target, config);
    function getAlbum(id, cb) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (request.readyState == 4 && request.status == 200) {
                var ablum = request.responseText.match(/ËùÊô×¨¼­.+"s-fc7">(.+?)</)[1];
                cb(ablum);
            }
        }
        var url = 'http://music.163.com/song?id=' + id;
        request.open('GET', url, true);
        request.send();
    }
})();
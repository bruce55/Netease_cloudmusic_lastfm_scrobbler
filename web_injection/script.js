$(document).ready(function () {
    $("#apiForm").submit(function (e) {
        e.preventDefault();
        var form = $(this).serializeArray();
        var apiInfo = {};
        form.forEach(function(item) {
            apiInfo[item.name] = item.value;
        });
        console.log(apiInfo);
        localStorage.apiInfo = JSON.stringify({
            "token": apiInfo.token,
            "sk": apiInfo.sk
        });
        
        $.get("js/main.js", function (data) {
            var script = data;
            data = data.replace("token: '',", "token: '" + apiInfo.token + "',");
            data = data.replace("session_key: ''", "session_key: '" + apiInfo.sk + "'");
            var connection = new WebSocket(apiInfo.address);
            connection.onopen = function() {
                connection.send(JSON.stringify({
                    "id": 0,
                    "method": "Runtime.evaluate",
                    "params": {
                        "expression": data
                    }
                }));
            };
        },"text");

    });
    $("#getPortForm").submit(function (e) {
        e.preventDefault();
        var port = $("#portInput").val();
        localStorage.storedPort = port;
        $("#getAddrIF").attr("src", "http://localhost:" + port + "/json");
    });
    if (localStorage.apiInfo) {
        var stored = JSON.parse(localStorage.apiInfo);
        $("#tokenInput").val(stored.token);
        $("#skInput").val(stored.sk);
    }
    if (localStorage.storedPort) {
        $("#portInput").val(localStorage.storedPort);
        $("#getPortForm").trigger("submit");
    }
})
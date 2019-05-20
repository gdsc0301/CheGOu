var pusher;
var room, system;

var me;
var rooms = {}, users = {};

var debug = true;

$(document).ready(function(e){
    me = {
        name: $("input#name").val(),
        email: $("input#email").val()
    }

    function signIn() {
        pusher = new Pusher('801df7fc97e6c3f08e25', {
            cluster: 'us2'
        });
        
        system = pusher.subscribe('serverEvents');
        system.bind('userIn', userIn);
        system.bind('userOut', userOut);

        roomIn('private-main-channel');
    }

    function roomIn(channelName) {
        rooms[channelName] = pusher.subscribe(channelName);
        rooms[channelName].bind('client-newMessage', receiveMessage);
    }
    
    function userIn(data){
        msg("USER IN - " + Date.now());
        msg(data);

        users[data.Email] = data;

        $("body > div.vertical.menu div.channels").append(
            "<a class='item' href='' id='" + data.Email + "'>" + data.Name + "</a>"
        )
    }
    
    function userOut(data){
        msg("USER OUT");
        msg(data);
    }
    
    function receiveMessage(data){
        msg("MESSAGE RECEIVED");
        msg(data);

        $("div#" + data.room).prepend("<div class='outMessage'>" + data.message + "</div>");
    }
    
    function sendMessage(data){
        $("div#" + data.room).append("<div class='myMessage'>" + data.message + "</div>");
        $("div#" + data.room + " input[type='text']").val("");

        rooms[data.room].trigger('client-newMessage', {
            name: me.name, 
            email: me.email, 
            message : data.message
        });
    }

    signIn();

    $("i#send").on('click', function(e){
        let room = $(this).attr('room');
        sendMessage({
            'room' : room,
            'name' : me.name,
            'email' : me.email,
            'message': $("div#" + room + " input#message").val()
        });
    });

    window.onclose(function(e){
        
    })

    function msg(message) {
        if(debug) console.log(message);
    }

    /*$("form#login").on("submit", function(e){
        e.preventDefault();
        console.log($(this).serialize());
        
        $.ajax({
            url:"/chat",
            method: "POST",
            data: $(this).serialize(),
            success: function(data){
                console.log(data);
            }
        });
    });*/
})
var pusher;
var room, system;

var me;
var rooms = {}, clients = {};

var debug = true;

$(document).ready(function(e){
    $("i#profile-menu-link").popup({
        popup: "#profile-menu",
        on: "click",
        inline     : false,
        hoverable  : true,
        position   : 'right center',
        delay: {
            show: 300,
            hide: 800
        }
    });

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
        msg("USER IN");
        msg(data);

        clients[data.Email] = data;

        $("body > div.vertical.menu div.channels").append(
            "<a class='item' href='' id='" + data.Email + "'>" + data.Name + "</a>"
        )
    }
    
    function userOut(data){
        msg("USER OUT");
        msg(data);

        document.getElementById(data.Email).remove();
        delete clients[data.Email];
    }
    
    function receiveMessage(data){
        msg("MESSAGE RECEIVED");
        msg(data);

        $("div#" + data.room + " > div.chat-feed").append("<div class='message outMessage'>" + data.message + "</div>");
    }
    
    function sendMessage(data){
        $("div#" + data.room + " > div.chat-feed").append("<div class='message myMessage'>" + data.message + "</div>");
        $("div#" + data.room + " input[type='text']").val("");

        rooms[data.room].trigger('client-newMessage', {
            name: me.name, 
            email: me.email, 
            message : data.message,
            room : data.room
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

    $("a#logout").on("click", function(e){
        e.preventDefault();
        console.log($(this).serialize());
        
        $.ajax({
            url:"/logout",
            method: "POST",
            data: me,
            success: function(data){
                window.location = "/";
            }
        });
    });
});

function getId(name) {
    return name + Date.Now();
}

function msg(message) {
    if(debug) console.log(message);
}
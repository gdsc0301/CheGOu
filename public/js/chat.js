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

        roomIn('main-channel');
        roomIn(me.email);
    }

    function roomIn(roomName) {
        if(rooms[roomName] !== null && rooms[roomName] !== undefined && rooms[roomName] !== ''){
            msg("This room already exists.");
            msg(rooms[roomName]);
            return false;
        } 

        rooms[roomName] = pusher.subscribe('private-' + roomName);
        rooms[roomName].bind('client-newMessage', receiveMessage);
    }
    
    function userIn(data){
        msg("USER IN");
        msg(data);

        clients[data.Email] = data;
        roomIn(clients[data.Email]);

        $("body > div.vertical.menu div.channels").append(
            "<p class='item' id='" + data.Email + "'>" + data.Name + "</p>"
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

        let chatBox = $(document.getElementById(data.room)).find("div.chat-feed");

        if(rooms[data.room].length > 0) {
            $(chatBox).removeClass('hidden');
            $(chatBox).append("<div class='message outMessage'><span class='bold orange'>" + data.name + "&nbsp;</span>" + data.message + "</div>");
        }else {
            newChat(data.room, data.name);
            $(chatBox).append("<div class='message outMessage'><span class='bold orange'>" + data.name + "&nbsp;</span>" + data.message + "</div>");
        }
    }
    
    function sendMessage(data){
        let chatBox = $(document.getElementById(data.room)).find("div.chat-feed");
        
        $(chatBox).append("<div class='message myMessage'><span class='bold orange'>Você </span>" + data.message + "</div>");
        $(chatBox).find("input[name='message']").val("");

        rooms[data.room].trigger('client-newMessage', data);

        msg("Message sented");
        msg(data);
    }

    function newChat(room, name) {
        msg("New Chat in/with:");
        msg(room + " | " + name);

        document.getElementById(room).classList.remove('hidden');

        roomIn(room);        
    }

    signIn();

    $("form.message").on('submit', function(e){
        e.preventDefault();
        msg("Form submitted.");

        msg($(this).serialize());

        let data = {};
        $(this).serializeArray().map(function(x){
            data[x.name] = x.value;
        });

        msg(data);

        sendMessage({
            'room' : data.email,
            'name' : me.name,
            'email' : me.email,
            'message': data.message
        });
    });

    $("button.send").on('click', function(e){
        e.preventDefault();
        msg("Button send pressed.");
        
        let room = $(this).attr('room');
        let chatBox = $(document.getElementById(room));

        sendMessage({
            'room' : room,
            'name' : me.name,
            'email' : me.email,
            'message': $(chatBox).find("input[name='message']").val()
        });
    });

    $("#logout").on("click", function(e){
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

    $("div.menu.channels > p.item").on('click', function(e){
        e.preventDefault();

        var room = $(this).attr('room');
        var name = $(this).text();

        msg("Trying to chat with: " + name + " Room: " + room);

        newChat(room, name);
    });
});

function getId(name) {
    return name + Date.Now();
}

function msg(message) {
    if(debug) console.log(message);
}
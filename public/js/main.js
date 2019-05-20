var pusher;
var channel;

function signIn() {
    pusher = new Pusher('801df7fc97e6c3f08e25', {
        cluster: 'us2'
    });
    channel = pusher.subscribe('private-main-channel');
}

function sendMessage(){
    let text = $("input[type='text']").val();
    $("div.feed").append("<p>" + text + "</p>");
    $("input[type='text']").val("");
    channel.trigger('client-newMessage', {message : text});
}
$(document).ready(function(e){
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
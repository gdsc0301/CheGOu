package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"text/template"

	"github.com/pusher/pusher-http-go"
)

type User struct {
	Name  string
	Email string
}

var client = pusher.Client{
	AppId:   "765573",
	Key:     "801df7fc97e6c3f08e25",
	Secret:  "63d235844252e0524640",
	Cluster: "us2",
}

func signIn(response http.ResponseWriter, request *http.Request) {
	var newUser = User{request.FormValue("name"), request.FormValue("email")}
	println(newUser.Name + " just logged in.")

	tmpl := template.Must(template.ParseFiles("templates/home.html"))

	tmpl.Execute(response, newUser)
}

func pusherAuth(res http.ResponseWriter, req *http.Request) {
	params, _ := ioutil.ReadAll(req.Body)
	response, err := client.AuthenticatePrivateChannel(params)

	if err != nil {
		panic(err)
	}

	fmt.Fprintf(res, string(response))
}

func buttonEvent(rw http.ResponseWriter, req *http.Request) {
	client.Trigger("main-channel", "button", "Someone pressed a button")
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.HandleFunc("/pusher/auth", pusherAuth)
	http.HandleFunc("/chat", signIn)

	log.Fatal(http.ListenAndServe(":8080", nil))
}

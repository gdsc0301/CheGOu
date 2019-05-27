package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"text/template"

	"github.com/pusher/pusher-http-go"
)

// User - The data sended for everyone who's connected when a new user SignIn.
type User struct {
	Name  string
	Email string
}

// Welcome - The data sended for the users when they SignIn.
type Welcome struct {
	Name    string
	Email   string
	UsersOn []User
}

var users []User

var client = pusher.Client{
	AppId:   "765573",
	Key:     "801df7fc97e6c3f08e25",
	Secret:  "63d235844252e0524640",
	Cluster: "us2",
}

var clients = make([]User, 0)

func signIn(response http.ResponseWriter, request *http.Request) {
	var bWelcome = Welcome{
		Name:    request.FormValue("name"),
		Email:   request.FormValue("email"),
		UsersOn: clients}

	alreadyLogged := false

	for _, d := range clients {
		if d.Name == bWelcome.Name {
			alreadyLogged = true
		}
	}

	user := User{
		Name:  bWelcome.Name,
		Email: bWelcome.Email}

	if alreadyLogged == false {
		clients = append(clients, user)

		println(bWelcome.Name + " just logged in.")
		client.Trigger("serverEvents", "userIn", user)
	} else {
		println(bWelcome.Name + " is already logged.")
	}

	println("Users on: ")
	printUsersOn()

	tmpl := template.Must(template.ParseFiles("templates/chat.html"))

	tmpl.Execute(response, bWelcome)
}

func logOut(writter http.ResponseWriter, request *http.Request) {
	gdBye := User{
		Name:  request.FormValue("name"),
		Email: request.FormValue("email"),
	}

	for i, d := range clients {
		if d.Name == gdBye.Name {
			clients = append(clients[:i], clients[i+1:]...)

			println(d.Name + " just Logged out.")
			println("Users on: ")
			printUsersOn()
			break
		}
	}

	client.Trigger("serverEvents", "userOut", gdBye)
}

func pusherAuth(res http.ResponseWriter, req *http.Request) {
	params, _ := ioutil.ReadAll(req.Body)
	response, err := client.AuthenticatePrivateChannel(params)

	if err != nil {
		panic(err)
	}

	fmt.Fprintf(res, string(response))
}

func printUsersOn() {
	for _, e := range clients {
		println("- " + e.Name)
	}
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("./public")))
	http.HandleFunc("/pusher/auth", pusherAuth)
	http.HandleFunc("/chat", signIn)
	http.HandleFunc("/logout", logOut)

	log.Fatal(http.ListenAndServe(":8080", nil))
}

/*Permet d'inverser le sens de la scrollbar*/
function normalizeScrollBar () {
	var element = document.querySelector('.messages');
	element.scrollTop = element.scrollHeight;
}

/*Ouverture du websocket, envoie des messages (avec le bouton et avec l'appuie sur entrée)*/
function webSocket (token) {
	let ws = new WebSocket("ws://kevin-chapron.fr:8080/ws");

	ws.onopen = function(event){
		var msg = {
		    auth: token
		};
		ws.send(JSON.stringify(msg));
	};
	ws.onclose = function(event){
		console.log("Disconnected from websocket !");
	};

	ws.onmessage = function(event){
		var e = JSON.parse(event.data);
		document.querySelector('.messages').innerHTML += "<p><span class='date'>[" + e.Date.replace('T', ' ') + "]</span><span class='nom'> (" + e.From + ")</span><span class='texte'> " + e.Text + "</span></p>";
		normalizeScrollBar();
	};

	ws.onerror = function(event){
		console.log("Error Websocket : " + event.message);
	};
	document.getElementById("button").addEventListener("click", function () {
		var msg = {
		    message: document.getElementById("message").value
		};
		ws.send(JSON.stringify(msg));
		document.getElementById("message").value = ""
	});

	document.getElementById("message").addEventListener("keydown", function (e) {
		if (e.which == 13 || e.keyCode == 13) {
			e.preventDefault();
			var msg = {
			    message: document.getElementById("message").value
			};
			ws.send(JSON.stringify(msg));
			document.getElementById("message").value = "";
		}
		
	});
}

/*Récupération des messages sur le serveur*/
function getMessages(token) {
    const request = new XMLHttpRequest();
    request.open("GET", "http://kevin-chapron.fr:8080/messages");
    request.setRequestHeader ("Authorization", "Basic " + token);

    request.onreadystatechange = function() {
	  if (this.readyState == 4 && this.status == 200) {
	    var response = JSON.parse(this.response);
	    response.forEach( e => {
			e.Date = e.Date.substr(0, 19);
			e.Text = e.Text.replace("<", "&lt;");
			e.Text = e.Text.replace(">", "&gt;")
	    	document.querySelector('.messages').innerHTML += "<p><span class='date'>[" + e.Date.replace('T', ' ') + "]</span><span class='nom'> (" + e.From + ")</span><span class='texte'> " + e.Text + "</span></p>";
	    });
		normalizeScrollBar();
	    webSocket(token);
	  }
	};

    request.send();
}

/*Connexion sur le serveur et récupération du token*/
function connect() {
	var request = new XMLHttpRequest();  
	request.onreadystatechange = function() {
	  if (this.readyState == 4 && this.status == 200) {
	    var response = JSON.parse(this.response);
	    document.getElementById("name").innerHTML = response.Name;
	    token = response.Token;
	    getMessages(token);
	  }
	};
	request.open("POST", "http://kevin-chapron.fr:8080/login");
	request.send(JSON.stringify({Code:"DELE19069709"}));

}

/*Lancement des fonctions*/
function init () {
	connect();
}

window.onload = init;



//Js pour les options de l'extension

function exportLocalStorage() {
	var exportJSON=[];
	for (var i = 0; i < localStorage.length; i++){
    	// do something with localStorage.getItem(localStorage.key(i));
    	//var currentJSON = {};
    	//currentJSON = JSON.parse(localStorage.getItem(localStorage.key(i)));
    	exportJSON.push(JSON.parse(localStorage.getItem(localStorage.key(i))));  		
    	
	}

	window.open('data:text/csv;charset=utf-8,' + encodeURI(JSON.stringify(exportJSON)));
}

        

window.onload = function(e) {
	//var test = $.("#butt").innerHTML;
	var button = document.getElementById("butt");
    button.onclick = function(){ exportLocalStorage() };
}
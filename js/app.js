function yeah(argument) {
	var n3 = document.getElementById('n3').value;
	if (n3 != "") {
		var n1 = Number(document.getElementById('n1').innerHTML);
		var n2 = Number(document.getElementById('n2').innerHTML);
		if((n1+n2) == n3){
			alert("ACERTOU!");
		}else{
			alert("ERROU!");
		}
		resetar();
	}
}	
function resetar() {
	alt1 = Math.floor((Math.random() * 10));
	alt2 = Math.floor((Math.random() * 12));
	document.getElementById("n3").value = "";
	document.getElementById("n1").innerHTML = alt1;
	document.getElementById("n2").innerHTML = alt2;
}

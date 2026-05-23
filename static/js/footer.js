
$.ajax({
	url:"./footer.html",
	async:false,
	success:function(res){
		document.getElementById("footer").innerHTML = res;
	}
})
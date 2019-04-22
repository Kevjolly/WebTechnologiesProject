/** JavaScript page for the Web Tech Project **/

$(document).ready(function(){

	/* Navbar */
	// Side nav for smaller sized screens
	$('.sidenav').sidenav();

	// Hide and show name of icon hoverred
	$("nav ul .waves-effect").hover(function(){
		// on hover mouse entering
		$(this).find("span").css("display", "inline-flex");
	}, function(){
		// on hover mouse leaving
		if (!$(this).parent().hasClass("active")){
			$(this).find("span").hide();			
		}
	});

	// Change active state of nav element according to click
	$("nav ul li").click(function(){
		$("nav ul li").removeClass("active");
		$("nav ul li span").hide();
		$(this).addClass("active");
		$(this).find("span").show();
	});
	// same for sidenav for smaller sized screens
	$(".sidenav li").click(function(){
		$(".sidenav li").removeClass("active");
		$(this).addClass("active");
	});

	// Search bar and sidenav search bar remove input button
	$(".search-close").click(function(){
		$(".search-input").val('');
	})

	// Search bar and sidenav search bar coherence between inputs
	$("#search-sidenav").change(function(){
		$("#search").val($('#search-sidenav').val());
	});
	$("#search").change(function(){
		$("#search-sidenav").val($('#search').val());
	});

	// Search when pressing enter
	$('.search-input').keypress(function(e){
		// Prevent default action on keypress enter
	    if ( e.which == 13 ){
			e.preventDefault();
			$(".search-icons").click();
	    }

	});	

	// go to choice between login or sign up
	$(".get-started-button").click(function(){
		$(".get-started").hide();
		$("#get-started-choice").show();
	});

	// Modal initiatisation
	$('.modal').modal({
		// Callback for Modal close
		onCloseEnd: function() { 
			$("nav ul li").removeClass("active");
			$(".sidenav li").removeClass("active");
			$("nav ul li span").hide();
			$(".navbar-home").addClass("active");
			$(".navbar-home").find("span").show(); 
		} 
	});

	// Chips in search text input
	// $('.chips').chips();

	// Launch search
	$(".search-icons").click(function(){
		var host = window.location.host;
		if ((host !== "localhost:8080") || (host !== "127.0.0.1:8080")){
			host = "http://" + host;
		}
		var url = host + "/search?search_content=" + $(".search-input").val();
		console.log(url);
		window.open(url, "_self");
	})

	// Tabs for search results
	$('.tabs').tabs({
		'swipeable':true
	});

	// SignUp
	$('#signupBtn').click(function () {
		if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test($("#signup-confirm-password").val())){
			if (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($("#signup-email").val())){
				if ($("#signup-confirm-password").val() === $("#signup-password").val()){
					$("#helper-text-password2").hide();
					signup($('#signup-email').val(), $('#signup-password').val(), $('#signup-username').val());
					$('#modal-signup').modal('close');
					$('#modal-verify').modal('open');
				} else {
					$("#helper-text-password2").show();
				}
			}
		}
	});

	$('.signup-passwords').change(function(){
		if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(this.value)){
			$("#helper-text-password1").hide();
			$(this).removeClass("invalid").addClass("valid");
		} else {
			$("#helper-text-password1").show();
			$(this).removeClass("valid").addClass("invalid");
		}
	});

	// Verify
	$('#verifyBtn').click(function () {
		verify($('#verify-email').val(), $('#verify-code').val());
		$('#modal-verify').modal('close');
		$('#modal-login').modal('open');
	});

	// SignOut
	$('#signoutBtn').click(function () {
		signout();
	});

	// SignIn
	$('#signinBtn').click(function () {
		signin($('#login-email').val(), $('#login-password').val());
		$('#modal-login').modal('close');
		$('#get-started-choice').hide();
	});
});

function navigation(page){
	var host = window.location.host;
	if ((host !== "localhost:8080") || (host !== "127.0.0.1:8080")){
		host = "http://" + host;
	}

	if (page === "home"){
		window.open(host, "_self");
	}
}

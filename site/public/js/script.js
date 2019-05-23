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
		var proceed = true;
    	var fileToSend = false;
    	var extensionStr = "";
		if( document.getElementById("signup-file").files.length != 0 ){
			fileToSend = true;
			// We check if the extension of the file given in input is correct
			extensionStr = $('#signup-file')[0].files[0].name.slice(($('#signup-file')[0].files[0].name.lastIndexOf(".") - 1 >>> 0) + 2);
			console.log(extensionStr);
			if (['png', 'jpeg', 'gif', "bmp", "jpg", "tiff"].indexOf(extensionStr) >= 0){
				console.log("Image Format is ok");
				var size = $('#signup-file')[0].files[0].size;
				var sizeMax = (3 * 1024 * 1024) -1;
				//Size max of 1MB
				if (size <= sizeMax){
					// Size inferior
				} else {
					proceed = false;
					M.toast({html: 'Image size must be inferior to 3 MB.'});
				}
			} else {
				proceed = false;
				M.toast({html: 'Images given must be of one the following formats: png, jpeg, gif, bmp, tiff.'});
			}
		}

		if (proceed){
			if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test($("#signup-confirm-password").val())){
				$("#helper-text-password1").hide();
				if (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($("#signup-email").val())){
					if ($("#signup-confirm-password").val() === $("#signup-password").val()){
						$("#helper-text-password2").hide();
				    	var chipInstance = M.Chips.getInstance($("#project-skills"));
				    	var dataNotSorted = chipInstance.chipsData
				    	var dataSorted = [];
				    	var crtData;
				    	for (var k=0; k<dataNotSorted.length; k++){
				    		crtData = dataNotSorted[k]
				    		dataSorted.push(crtData["tag"]);
				    	}
				    	if (dataSorted.length !== 0){
							signup($('#signup-email').val(), $('#signup-password').val(), $('#signup-username').val(), dataSorted, extensionStr, fileToSend);
						} else {
							M.toast({html: 'You must give yourself at least one skill.'});
						}
					} else {
						$("#helper-text-password2").show();
						M.toast({html: 'Enter the same passwords.'})
					}
				} else {
					M.toast({html: 'Enter a valid email.'})
				}
			} else {
				$("#helper-text-password1").show();
				M.toast({html: 'Enter a valid password.'})
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
		if (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($("#verify-email").val())){
			if($("#verify-code").val()!=""){
				verify($('#verify-email').val(), $('#verify-code').val());
			} else {
				M.toast({html: 'Enter the code.'})
			}		
		} else {
			M.toast({html: 'Enter a valid email.'})
		}
	});

	// SignOut
	$('#signoutBtn').click(function () {
		signout();
	});

	// SignIn
	$('#signinBtn').click(function () {
		if (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($("#login-email").val())){
			signin($('#login-email').val(), $('#login-password').val());
		} else {
			M.toast({html: 'Enter a valid email.'})
		}
	});


	// Create a project
	// List of skills
	$('.chips-initial').chips({
	    data: [{
      		tag: 'Teamwork',
    	}, {
     		tag: 'Communication',
    	}, {
     		tag: 'Organisation',
    	}],
		placeholder: 'Enter skills',
		secondaryPlaceholder: '+ add skills',
	});

	// Send project details then get id of created project and save image
    $('#createProjectBtn').click(function () {
    	if (cognitoUser){	
	    	var fileToSend = false;
	    	var proceed = true;
	    	var extensionStr = "";
			if( document.getElementById("project-file").files.length != 0 ){
				fileToSend = true;
				// We check if the extension of the file given in input is correct
				var extensionStr = $('#project-file')[0].files[0].name.slice(($('#project-file')[0].files[0].name.lastIndexOf(".") - 1 >>> 0) + 2);
				console.log(extensionStr);
				if (['png', 'jpeg', 'gif', "bmp", "jpg", "tiff"].indexOf(extensionStr) >= 0){
					console.log("Image Format is ok");
					var size = $('#project-file')[0].files[0].size;
					var sizeMax = (3 * 1024 * 1024) -1;
					//Size max of 1MB
					if (size <= sizeMax){
						// Size inferior
					} else {
						proceed = false;
						M.toast({html: 'Image size must be inferior to 3 MB.'});
					}
				} else {
					proceed = false;
					M.toast({html: 'Images given must be of one the following formats: png, jpeg, gif, bmp, tiff.'});
				}
			}

			if (proceed){
				if ($("#project-name").val()!==""){
					if ($("#project-description").val()!==""){
				    	var chipInstance = M.Chips.getInstance($("#project-skills"));
				    	var dataNotSorted = chipInstance.chipsData
				    	var dataSorted = [];
				    	var crtData;
				    	for (var k=0; k<dataNotSorted.length; k++){
				    		crtData = dataNotSorted[k]
				    		dataSorted.push(crtData["tag"]);
				    	}
				    	if (dataSorted.length !== 0){

					    	var dataToSend = {desc: $('#project-description').val(), skills: dataSorted, name: $("#project-name").val()};
					    	console.log(dataToSend);
					        $.ajax({
					            contentType: 'application/json',
					            headers: {
					                Authorization: authToken
					            },
					            data: JSON.stringify(dataToSend),
					            dataType: 'json',
					            success: function (data) {
					                console.log("project created successfully", data);
					                M.toast({html: 'Project created!'});
					            	var dataR = data["data"];
					            	var projectID = dataR["projectId"];

					            	if (fileToSend){

									    var dataToGive = new FormData();
									    var firstFile = $('#project-file')[0].files[0];
										var filenameToSend = String(projectID)+"."+extensionStr
										console.log(filenameToSend);
									    dataToGive.append('file', firstFile, filenameToSend);
									    $.ajax({
	    									contentType: 'application/json',
					            			headers: {
					                			Authorization: authToken
					            			},
									        url: '/addprojectimage',
									        data: dataToGive,
									        cache: false,
									        contentType: false,
									        processData: false,
									        method: 'POST',
									        type: 'POST', // For jQuery < 1.9
									        success: function(data){
									            console.log(data);
									            $('#modal-project').modal('close');
									            M.toast({html: 'Image saved for project!'});
									        },
									        error: function (err) {
							                	console.log("failed to save the image ", err);
												M.toast({html: 'Error when saving the image!'});
						            		}
								    	});
									}
					            },
					            error: function (err) {
					                console.log("failed to create the project", err);
									M.toast({html: 'Error when creating the project!'});
					            },
					            processData: false,
					            type: 'POST',
					            url: '/project/create'
					        });
						} else {
							M.toast({html: 'You must give at least one skill to the project.'});
						}
					} else {
						M.toast({html: 'You must give a description to the project.'});
					}
				} else {
					M.toast({html: 'You must give a title to the project.'});
				}
			}
		} else {
			M.toast({html: 'You must be logged in to create a project.'});
			$('#modal-login').modal('open');
		}
    });

	$(window).resize(function() {
		if ($("#project-container-med").is(':visible')){
			$("#main-project").attr('style', 'min-height: 750px !important');
		} else {
			$("#main-project").attr('style', 'min-height: 450px !important');
		}
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

AWS.config.update({
	region: 'eu-west-2',
	credentials: new AWS.CognitoIdentityCredentials({
		IdentityPoolId: 'eu-west-2:4be81d47-fe44-4391-8f9c-e1fd894217dc'
	})
});

var s3 = new AWS.S3({
	apiVersion: '2006-03-01',
	params: { Bucket: 'teamup-images' }
});

/** JavaScript page for the Web Tech Project **/
$(document).ready(function () {
	/* Navbar */
	// Side nav for smaller sized screens
	$('.sidenav').sidenav();

	// Hide and show name of icon hoverred
	$("nav ul .waves-effect").hover(function () {
		// on hover mouse entering
		$(this).find("span").css("display", "inline-flex");
	}, function () {
		// on hover mouse leaving
		if (!$(this).parent().hasClass("active")) {
			$(this).find("span").hide();
		}
	});

	// Change active state of nav element according to click
	$("nav ul li").click(function () {
		$("nav ul li").removeClass("active");
		$("nav ul li span").hide();
		$(this).addClass("active");
		$(this).find("span").show();
	});
	// same for sidenav for smaller sized screens
	$(".sidenav li").click(function () {
		$(".sidenav li").removeClass("active");
		$(this).addClass("active");
	});

	// Search bar and sidenav search bar remove input button
	$(".search-close").click(function () {
		$(".search-input").val('');
	})

	// Search bar and sidenav search bar coherence between inputs
	$("#search-sidenav").change(function () {
		$("#search").val($('#search-sidenav').val());
	});
	$("#search").change(function () {
		$("#search-sidenav").val($('#search').val());
	});

	// Search when pressing enter
	$('.search-input').keypress(function (e) {
		// Prevent default action on keypress enter
		if (e.which == 13) {
			e.preventDefault();
			$("#search-icons1").click();
		}
	});

	// go to choice between login or sign up
	$(".get-started-button").click(function () {
		$(".get-started").hide();
		$("#get-started-choice").show();
	});

	// Modal initiatisation
	$('.modal').modal({
		// Callback for Modal close
		onCloseEnd: function () {
			$("nav ul li").removeClass("active");
			$(".sidenav li").removeClass("active");
			$("nav ul li span").hide();
			$(".navbar-home").addClass("active");
			$(".navbar-home").find("span").show();
		}
	});

	// select init
	$('select').formSelect();

	$('#select-navbar').on('change', function () {
		$("#select-sidenav").val($('#select-navbar').val());
		$('#select-sidenav').formSelect();
	});

	$('#select-sidenav').on('change', function () {
		$("#select-navbar").val($('#select-sidenav').val());
		$('#select-navbar').formSelect();
	});

	// Launch search
	$(".search-icons").click(function () {
		if ($(".select-search").val() !== null) {
			if (($(".search-input").val() !== null) && ($(".search-input").val() !== "")) {
				if ($("#select-navbar").val() === "1") {
					returnSearchResults("user", 1);
				} else if ($("#select-navbar").val() === "2") {
					returnSearchResults("project", 1);
				} else {
					M.toast({ html: 'Search could not proceed due to a fail in the choice selection.' });
				}
			} else {
				M.toast({ html: 'The search bar is empty.' });
			}
		} else {
			M.toast({ html: 'You need to choose either to search users or projects.' });
		}
	})

	// SignUp
	$('#signupBtn').click(function () {
		var proceed = true;
		var fileToSend = false;
		var extensionStr = "";
		if (document.getElementById("signup-file").files.length != 0) {
			fileToSend = true;
			// We check if the extension of the file given in input is correct
			extensionStr = $('#signup-file')[0].files[0].name.slice(($('#signup-file')[0].files[0].name.lastIndexOf(".") - 1 >>> 0) + 2);
			console.log(extensionStr);
			if (['png', 'jpeg', 'gif', "bmp", "jpg", "tiff"].indexOf(extensionStr) >= 0) {
				console.log("Image Format is ok");
				var size = $('#signup-file')[0].files[0].size;
				var sizeMax = (3 * 1024 * 1024) - 1;
				//Size max of 1MB
				if (size <= sizeMax) {
					// Size inferior
				} else {
					proceed = false;
					M.toast({ html: 'Image size must be inferior to 3 MB.' });
				}
			} else {
				proceed = false;
				M.toast({ html: 'Images given must be of one the following formats: png, jpeg, gif, bmp, tiff.' });
			}
		}

		if (proceed) {
			if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test($("#signup-confirm-password").val())) {
				$("#helper-text-password1").hide();
				if (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($("#signup-email").val())) {
					if ($("#signup-confirm-password").val() === $("#signup-password").val()) {
						$("#helper-text-password2").hide();
						var chipInstance = M.Chips.getInstance($("#project-skills"));
						var dataNotSorted = chipInstance.chipsData
						var dataSorted = [];
						var crtData;
						for (var k = 0; k < dataNotSorted.length; k++) {
							crtData = dataNotSorted[k]
							dataSorted.push(crtData["tag"]);
						}
						if (dataSorted.length !== 0) {
							signup($('#signup-email').val(), $('#signup-password').val(), $('#signup-username').val(), dataSorted, extensionStr, fileToSend);
						} else {
							M.toast({ html: 'You must give yourself at least one skill.' });
						}
					} else {
						$("#helper-text-password2").show();
						M.toast({ html: 'Enter the same passwords.' })
					}
				} else {
					M.toast({ html: 'Enter a valid email.' })
				}
			} else {
				$("#helper-text-password1").show();
				M.toast({ html: 'Enter a valid password.' })
			}
		}
	});

	$('.signup-passwords').change(function () {
		if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(this.value)) {
			$("#helper-text-password1").hide();
			$(this).removeClass("invalid").addClass("valid");
		} else {
			$("#helper-text-password1").show();
			$(this).removeClass("valid").addClass("invalid");
		}
	});

	// Verify
	$('#verifyBtn').click(function () {
		if (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($("#verify-email").val())) {
			if ($("#verify-code").val() != "") {
				verify($('#verify-email').val(), $('#verify-code').val());
			} else {
				M.toast({ html: 'Enter the code.' })
			}
		} else {
			M.toast({ html: 'Enter a valid email.' })
		}
	});

	// SignOut
	$('#signoutBtn').click(function () {
		signout();
	});

	// SignIn
	$('#signinBtn').click(function () {
		if (/^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($("#login-email").val())) {
			signin($('#login-email').val(), $('#login-password').val(), function () {
				M.toast({ html: 'Signed in!' });
				$('#modal-login').modal('close');
				$('#get-started-choice').hide();
				location.reload();
			}, function (err) {
				console.log("Authenticate user failure");
				console.log(err);
				if (err.code === "UserNotConfirmedException") {
					M.toast({ html: 'Failed!' });
					M.toast({ html: 'Your account is not verified.' });
					$('#modal-login').modal('close');
					$('#modal-verify').modal('open');
				} else {
					M.toast({ html: 'Failed!' });
					M.toast({ html: err.message });
				}
			});
		} else {
			M.toast({ html: 'Enter a valid email.' })
		}
	});

	$(".my-profile").click(function (e) {
		e.preventDefault();
		var host = window.location.host;
		if ((host !== "localhost:8081") || (host !== "127.0.0.1:8081")) {
			host = "http://" + host;
		}
		var url = host + '/user/profile?id=' + userEmail;
		window.open(url, "_self");
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
		if (cognitoUser) {
			var fileToSend = false;
			var proceed = true;
			var extensionStr = "";
			if (document.getElementById("project-file").files.length != 0) {
				fileToSend = true;
				// We check if the extension of the file given in input is correct
				var extensionStr = $('#project-file')[0].files[0].name.slice(($('#project-file')[0].files[0].name.lastIndexOf(".") - 1 >>> 0) + 2);
				console.log(extensionStr);
				if (['png', 'jpeg', 'gif', "bmp", "jpg", "tiff"].indexOf(extensionStr) >= 0) {
					console.log("Image Format is ok");
					var size = $('#project-file')[0].files[0].size;
					var sizeMax = (3 * 1024 * 1024) - 1;
					//Size max of 1MB
					if (size <= sizeMax) {
						// Size inferior
					} else {
						proceed = false;
						M.toast({ html: 'Image size must be inferior to 3 MB.' });
					}
				} else {
					proceed = false;
					M.toast({ html: 'Images given must be of one the following formats: png, jpeg, gif, bmp, tiff.' });
				}
			}

			if (proceed) {
				if ($("#project-name").val() !== "") {
					if ($("#project-description").val() !== "") {
						var chipInstance = M.Chips.getInstance($("#project-skills"));
						var dataNotSorted = chipInstance.chipsData
						var dataSorted = [];
						var crtData;
						for (var k = 0; k < dataNotSorted.length; k++) {
							crtData = dataNotSorted[k]
							dataSorted.push(crtData["tag"]);
						}
						if (dataSorted.length !== 0) {

							var currentTimeStamp = Date.now();
							var filenameToSend = String(currentTimeStamp) + "." + extensionStr;
							var dataToSend = { desc: $('#project-description').val(), skills: dataSorted, name: $("#project-name").val(), image: filenameToSend };
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
									M.toast({ html: 'Project created!' });
									var dataR = data["data"];
									var projectID = dataR["projectId"];

									if (fileToSend) {
										s3.upload({
											Key: filenameToSend,
											Body: $('#project-file')[0].files[0],
											ACL: 'public-read'
										}, function (err, data) {
											if (err) {
												console.log("failed to save the image ", err);
												M.toast({ html: 'Error when saving the image!' });
											} else {
												console.log(data);
												$('#modal-project').modal('close');
												M.toast({ html: 'Image saved for project!' });
											}
										});
									} else {
										$('#modal-project').modal('close');
									}
								},
								error: function (err) {
									console.log("failed to create the project", err);
									M.toast({ html: 'Error when creating the project!' });
								},
								processData: false,
								type: 'POST',
								url: '/project/create'
							});
						} else {
							M.toast({ html: 'You must give at least one skill to the project.' });
						}
					} else {
						M.toast({ html: 'You must give a description to the project.' });
					}
				} else {
					M.toast({ html: 'You must give a title to the project.' });
				}
			}
		} else {
			M.toast({ html: 'You must be logged in to create a project.' });
			$('#modal-login').modal('open');
		}
	});

	// Set size of main body on resize
	$(window).resize(function () {
		if ($("#project-container-med").is(':visible')) {
			$("#main-project").attr('style', 'min-height: 1000px !important');
			$("#main-user-profile").attr('style', 'min-height: 800px !important');
		} else {
			$("#main-project").attr('style', 'min-height: 600px !important');
			$("#main-user-profile").attr('style', 'min-height: 500px !important');
		}

		if ($(window).width() <= 1092) {
			$(".title-user-size").addClass("title-user-med-and-down-bis");
			$(".title-user-size").removeClass("title-user-large");
		} else {
			$(".title-user-size").addClass("title-user-large");
			$(".title-user-size").removeClass("title-user-med-and-down-bis");
		}		
	});

	// Set size of main body at the start
	if ($(window).width() <= 1092) {
		$("#main-project").attr('style', 'min-height: 1000px !important');
		$("#main-user-profile").attr('style', 'min-height: 800px !important');
		$(".title-user-size").addClass("title-user-med-and-down-bis");
		$(".title-user-size").removeClass("title-user-large");
	} else {
		$(".title-user-size").addClass("title-user-large");
		$(".title-user-size").removeClass("title-user-med-and-down-bis");
	}

	// Pagination for search pages
	if (window.location.href.indexOf("search") > -1) {
		var choiceSearch = "";

		var numberOfResults = parseInt($('#total').attr('data-value'));
		var currentPage = parseInt($('#current-page').attr('data-value'));
		var keywords = $('#keywords').attr('data-value');
		var choiceSearch = $('#type-of-search').attr('data-value');

		var resultsPage = 12;
		var numberOfPages = Math.floor(numberOfResults / resultsPage) + 1;
		var strPagination = "";

		if (numberOfPages === 1) {
			strPagination += '<li class="disabled"><a href="#!"><i class="material-icons">chevron_left</i></a></li>';
			strPagination += '<li class="active"><a href="/' + String(choiceSearch) + '/search?keyword=' + String(keywords) + '&page=' + String(currentPage) + '&count=' + String(resultsPage) + '">1</a></li>';
			strPagination += '<li class="disabled"><a href="#!"><i class="material-icons">chevron_right</i></a></li>';
		} else {
			if (currentPage === 1) {
				strPagination += '<li class="disabled"><a href="#!"><i class="material-icons">chevron_left</i></a></li>';
			} else {
				strPagination += '<li class="waves-effect"><a href="/' + String(choiceSearch) + '/search?keyword=' + String(keywords) + '&page=' + String((currentPage - 1)) + '&count=' + String(resultsPage) + '"><i class="material-icons">chevron_left</i></a></li>';
			}
			for (var k = 1; k <= numberOfPages; k++) {
				if (k === currentPage) {
					strPagination += '<li class="active"><a href="/' + String(choiceSearch) + '/search?keyword=' + String(keywords) + '&page=' + String(k) + '&count=' + String(resultsPage) + '">' + String(k) + '</a></li>';
				} else {
					strPagination += '<li class="waves-effect"><a href="/' + String(choiceSearch) + '/search?keyword=' + String(keywords) + '&page=' + String(k) + '&count=' + String(resultsPage) + '">' + String(k) + '</a></li>';
				}
			}

			if (currentPage === numberOfPages) {
				strPagination += '<li class="disabled"><a href="#!"><i class="material-icons">chevron_right</i></a></li>';
			} else {
				strPagination += '<li class="waves-effect"><a href="/' + String(choiceSearch) + '/search?keyword=' + String(keywords) + '&page=' + String((currentPage + 1)) + '&count=' + resultsPage + '"><i class="material-icons">chevron_right</i></a></li>';
			}
		}
		$('#pagination-results').html(strPagination);
    }

	if (cognitoUser) {
		if (window.location.href.indexOf("user/profile") > -1) {
			$(".if-not-same-user").show();
			var user_profiled = $('#hidden-div-values').attr('data-value');
			if (user_profiled === userEmail){
				$(".if-not-same-user").hide();			
			} else {				
				$(".if-not-same-user").show();
			}
		}

		if (window.location.href.indexOf("project/profile") > -1) {
			$(".applicationBtn").css("display", "inline-block");
			if ($('#hidden-div-values').attr('data-value') === userEmail){
				$(".applicationBtn").hide();
				$(".quitBtn").hide();			
			} else {
				$('.hidden-div').each(function(){
	    			if ($(this).attr('data-value') === userEmail){
	    				$(".quitBtn").css("display", "inline-block");
	    				$(".applicationBtn").hide();
	    			}
				});
			}
		}
	}

	// Message page
	// Tabs for search results
	$('.tabs').tabs({
		'swipeable':true
	});

	// Focus on conversatiions on the left column
	$(".collection-item-message").click(function (e) {
		$(".collection-item-message").removeClass("lighten-2");
		$(".collection-item-message").addClass("lighten-5");
		$(this).removeClass("lighten-5");
		$(this).addClass("lighten-2");
	});

	$(".collection-item-message").hover(function(){
			$(this).removeClass("lighten-5");
			$(this).addClass("lighten-3");
		}, function(){
			$(this).removeClass("lighten-3");
			$(this).addClass("lighten-5");
		}
	);

	$(".link-to-profile-user").click(function(e){
		e.stopPropagation();
	});

	// Quit a project
	$('#quitProjectBtn').click(function () {
		var project_id = parseInt($("#hidden-div").attr('data-value'));
		var dataForQuit = {projectId: project_id};
		if (cognitoUser){		
			$.ajax({
				contentType: 'application/json',
				headers: {
					Authorization: authToken
				},
				data: JSON.stringify(dataForQuit),
				dataType: 'json',
				success: function (data) {
					console.log("project successfully left", data);
					M.toast({ html: 'You left this project!' });
				},
				error: function (err) {
					console.log("failed to quit the project", err);
					M.toast({ html: 'Error when quiting the project!' });
				},
				processData: false,
				type: 'POST',
				url: '/project/quit'
			});
		} else {
			$('#modal-quit').modal('close');
			M.toast({ html: 'You are not logged in' });
			$('#modal-login').modal('open');
		}		
	});

	// Apply for a project
	$('#applyProjectBtn').click(function () {
		if (cognitoUser){
			var project_id = parseInt($("#hidden-div").attr('data-value'));
			var userTo = $("#hidden-div-values").attr('data-value');
			var message = $("#apply-description").val();
			if (message !== null && message !== ""){
				var dataForApply = {projectId: project_id, type: "application", to: userTo ,message: message};
				sendSingleMessage(dataForApply, function(){
					M.toast({ html: 'Application sent' });
					$('#modal-apply').modal('close');
					$('.applicationBtn').hide();
				}, function (err){
					console.log("Application failure");
					console.log(err);
					M.toast({ html: 'Failed!' });
					M.toast({ html: err.message });
				});
			} else {
				M.toast({ html: 'You need to give a message.'});
			}
		} else {
			$('#modal-apply').modal('close');
			M.toast({ html: 'You are not logged in' });
			$('#modal-login').modal('open');
		}
	});

	// Send initial message
	$('#messageSendBtn').click(function () {
		if (cognitoUser){
			var message = $("#message-description").val();
			var userTo = $("#hidden-div-values").attr('data-value');
			if (message !== null && message !== ""){
				var dataForMessage = {type: "normal", to: userTo, message: message};
				sendSingleMessage(dataForApply, function(){
					M.toast({ html: 'Message sent' });
					$('#modal-message').modal('close');
				}, function (err){
					console.log("Send message failure");
					console.log(err);
					M.toast({ html: 'Failed!' });
					M.toast({ html: err.message });
				});
			} else {
				M.toast({ html: 'You need to give a message.'});
			}
		} else {
			$('#modal-message').modal('close');
			M.toast({ html: 'You are not logged in' });
			$('#modal-login').modal('open');
		}
	});

	// Accept join project
	$('#acceptBtn').click(function () {
		if (cognitoUser){
			var message = $("#accept-description").val();
			var userTo = $("#hidden-appli-user-email").attr('data-value');
			var project_id = parseInt($("#hidden-appli-project-id").attr('data-value'));
			if (message !== null && message !== ""){
				var dataForAccept = {projectId: project_id, applicant: userTo};
				$.ajax({
					contentType: 'application/json',
					headers: {
						Authorization: authToken
					},
					data: JSON.stringify(dataForAccept),
					dataType: 'json',
					success: function (data) {
						$(".texto-application").hide();
						M.toast({ html: 'Application accepted' });

						var dataForMessage = {type: "normal", to: userTo, message: message};
						sendSingleMessage(dataForMessage, function(){
							M.toast({ html: 'Message sent' });
							$('#modal-accept').modal('close');
						}, function (err){
							console.log("Send message failure");
							console.log(err);
							M.toast({ html: 'Send message failed!' });
							M.toast({ html: err.message });
						});
					},
					error: function (err) {
						console.log("failed to approve a user", err);
						M.toast({ html: 'Error when approving the user!' });
					},
					processData: false,
					type: 'POST',
					url: '/project/approve'
				});	
			} else {
				M.toast({ html: 'You need to give a message.'});
			}		
		} else {
			$('#modal-accept').modal('close');
			M.toast({ html: 'You are not logged in' });
			$('#modal-login').modal('open');
		}
	});

	// Refuse join project
	$('#refuseBtn').click(function () {
		if (cognitoUser){
			var message = $("#refuse-description").val();
			var userTo = $("#hidden-appli-user-email").attr('data-value');
			if (message !== null && message !== ""){
				$(".texto-application").hide();
				M.toast({ html: 'Application refused' });	
			
				var dataForMessage = {type: "normal", to: userTo, message: message};
				sendSingleMessage(dataForMessage, function(){
					M.toast({ html: 'Message sent' });
					$('#modal-refuse').modal('close');
				}, function (err){
					console.log("Send message failure");
					console.log(err);
					M.toast({ html: 'Send message failed!' });
					M.toast({ html: err.message });
				});
			} else {
				M.toast({ html: 'You need to give a message.'});
			}		
		} else {
			$('#modal-refuse').modal('close');
			M.toast({ html: 'You are not logged in' });
			$('#modal-login').modal('open');
		}
	});

	// Accept join project
	$('#joinBtn').click(function () {
		if (cognitoUser){
			var message = $("#join-description").val();
			var userFrom = $("#hidden-invit-user-email").attr('data-value');
			var project_id = parseInt($("#hidden-invit-project-id").attr('data-value'));
			if (message !== null && message !== ""){
				var dataForJoin = {projectId: project_id};
				$.ajax({
					contentType: 'application/json',
					headers: {
						Authorization: authToken
					},
					data: JSON.stringify(dataForJoin),
					dataType: 'json',
					success: function (data) {
						$(".texto-invitation").hide();
						M.toast({ html: 'Project joined' });	

						var dataForMessage = {type: "normal", to: userFrom, message: message};
						sendSingleMessage(dataForMessage, function(){
							M.toast({ html: 'Message sent' });
							$('#modal-join').modal('close');
						}, function (err){
							console.log("Send message failure");
							console.log(err);
							M.toast({ html: 'Send message failed!' });
							M.toast({ html: err.message });
						});
					},
					error: function (err) {
						console.log("failed to join the project", err);
						M.toast({ html: 'Error when joining the project!' });
					},
					processData: false,
					type: 'POST',
					url: '/project/join'
				});	
			} else {
				M.toast({ html: 'You need to give a message.'});
			}		
		} else {
			$('#modal-join').modal('close');
			M.toast({ html: 'You are not logged in' });
			$('#modal-login').modal('open');
		}
	});

	// Refuse invitation project
	$('#dismissBtn').click(function () {
		if (cognitoUser){
			var message = $("#dismiss-description").val();
			var userTo = $("#hidden-invit-user-email").attr('data-value');
			if (message !== null && message !== ""){
				$(".texto-invitation").hide();
				M.toast({ html: 'Invitation refused' });	
			
				var dataForMessage = {type: "normal", to: userTo, message: message};
				sendSingleMessage(dataForMessage, function(){
					M.toast({ html: 'Message sent' });
					$('#modal-dismiss').modal('close');
				}, function (err){
					console.log("Send message failure");
					console.log(err);
					M.toast({ html: 'Send message failed!' });
					M.toast({ html: err.message });
				});
			} else {
				M.toast({ html: 'You need to give a message.'});
			}		
		} else {
			$('#modal-dismiss').modal('close');
			M.toast({ html: 'You are not logged in' });
			$('#modal-login').modal('open');
		}
	});

	// Calculate notification count


	// Get Message count blabla	


	// Get messages for side conv bar


	// Get message for one conversation
		// Get for conv between 1 and 1 users
		// Get for project conv
});

function returnSearchResults(choice, page) {
	/* Returns page results - choice: user or project, page: page to give */
	var resultsPerPage = 12;
	var host = window.location.host;
	if ((host !== "localhost:8081") || (host !== "127.0.0.1:8081")) {
		host = "http://" + host;
	}
	var url = host + '/' + choice + '/search?keyword=' + $(".search-input").val() + '&page=' + page + '&count=' + resultsPerPage;
	window.open(url, "_self");
}

function navigation(page) {
	var host = window.location.host;
	if ((host !== "localhost:8080") || (host !== "127.0.0.1:8080")) {
		host = "http://" + host;
	}

	if (page === "home") {
		window.open(host, "_self");
	}
}

function scrollToTheBottom(id){
	/* Call it to scroll to the bottom of messages */
    var el = document.getElementById("#"+id);
    el.scrollTop = el.scrollHeight;
}


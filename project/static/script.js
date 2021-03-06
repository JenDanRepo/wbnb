
$(document).ready(function(){
	var buttonList = $('#ctrl-btn');
	var tButtons = $('table');
	var userId;

	var csrf = $('#token').data("csrf");

	$.post('/parties/json', {
					verb: 'identify',
					csrf_token: csrf,
		}).then(function(response){
			userId = response;
	});


	// Join/Edit/Leave buttons within the table
	tButtons.on('click','button',function(e){
		csrf = $('#token').data("csrf"); // CSRF Token
		verb = $(e.target).data("verb");
		mid = $(e.target).data("mid");
		url = `/parties/${mid}/ajoin`;

		$.post(url, {
					verb: verb,
					csrf_token: csrf,
					mid: mid
		}).then(function(response){
			if (response.r.status === "success"){
				$(e.target).removeClass('btn-success');
				$(e.target).addClass('btn-danger');
				$(e.target).attr("data-verb", "leave");
				$(e.target).text("Leave");
			}
		});
	});

	// Control buttons betweent the image and the table
	buttonList.on('click','button',function(e){
		csrf = $('#token').data("csrf"); // CSRF Token
		url = `/parties/json`;
		verb = $(e.target).data("verb");

		if (verb === 'today') return;
		// "X-CSRFToken" =  is what would go in the header.

		$.post(url, {
					verb: verb,
					csrf_token: csrf
					// lat: "37.9126212",
					// lng: "-122.2864609"
				}).then(function(response){
			
			if (response === "login_required"){
				window.location.replace("/users/login")
			}
			$tbody = $('tbody');
			$tbody.empty();

			$btnToday.text('Today');
			todayToggle = 'hide';

			let plist = response.results; // Party List

			plist = plist.sort(function(a,b){return parseFloat(a.distance) > parseFloat(b.distance)})

			for (let i = 0; i < plist.length; i++){
				let $tr = $('<tr>')

				let $tdButton = $('<td>')

				if (!plist[i].attendee_id && parseInt(plist[i].host_id) != parseInt(userId)){
					if (userId === "0"){
						let $aLogin = $('<a>').text('Join').addClass('btn').addClass('btn-success');
						$aLogin.attr('href',"/users/login");
						$tdButton.append($aLogin)
					} else {	
						let $button = $('<button>').text('Join').addClass('btn').addClass('btn-success');
						$button.attr("data-mid", plist[i].id)
						$button.attr("data-verb", "join")
						$tdButton.append($button);
					}
				}

				if ( parseInt(plist[i].attendee_id) === parseInt(userId)){
					let $button = $('<button>').text('Leave').addClass('btn').addClass('btn-danger');
					$button.attr("data-mid", plist[i].id)
					$button.attr("data-verb", "leave")
					$tdButton.append($button);
				}

				if ( parseInt(plist[i].host_id) === parseInt(userId)){
					let $aLink = $('<a>').text('Edit').addClass('btn').addClass('btn-primary');
					$aLink.attr('href',"/parties/" + plist[i].id + "/edit")
					$tdButton.append($aLink)
				}

				let $tdHost = $('<td>');
				let $aHost = $('<a>').text(" "+ plist[i].name).attr('href', "/users/" + plist[i].host_id);
				let $hostImage = $('<img>').addClass("list-image").attr("src", plist[i].image);
				$aHost.prepend($hostImage);
				$tdHost.append($aHost);

				let $tdDistance;
				if (userId > 0){	
					$tdDistance = $('<td>').text((plist[i].distance || "") + " km");
				} else{
					$tdDistance = $('<td>');
				}

				let $tdDescription = $('<td>').text(plist[i].description);

				let $tdCost = $('<td>').text("$" + plist[i].cost);

				let $tdLocation = $('<td>').text(plist[i].address);

				let $tdDate = $('<td>').text(plist[i].date);

				let $tdTime = $('<td>').text(plist[i].time);

				$tr.append($tdButton)
					.append($tdHost)
					.append($tdDistance)
					.append($tdDescription)
					.append($tdCost)
					.append($tdLocation)
					.append($tdDate)
					.append($tdTime);
				$tbody.append($tr)
			}
			
		});
	});
	
	var todayToggle;

	var $btnToday = $('#btn-today');
	$btnToday.on('click',function(e){
		// get all the table rows

		let $tRows = $('tbody>tr');

		if (todayToggle === 'hide' || todayToggle === undefined){
			todayToggle = 'show';
			let todayStr = new Date().toISOString().slice(0,10)
			for (let i=0; i < $tRows.length; i++){
				if ($tRows.eq(i).children().eq(6).text() !== todayStr){
					$tRows.eq(i).hide();
				}
			}
			$btnToday.text('Any Day');
			return;
		}

		if (todayToggle === 'show'){
			todayToggle = 'hide';
			$tRows.show();
			$btnToday.text('Today');
		}

	});

	// Now that our even listeners are established, make something happen:
	$('#default-button').trigger('click');
})

// function showPosition(position) {
//     console.log("lat: ",position.coords.latitude);
//     console.log("lng: ",position.coords.longitude); 
//     return {lat: position.coords.latitude, lng: position.coords.longitude}
// }
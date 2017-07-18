function $(id, element, log){
	var ident = id.slice(1);
	if(id.match(/^\#[^\.]*$/)) return document.getElementById(ident);
	if(id.match(/^\./)) return document.getElementsByClassName(ident);
	return document.querySelectorAll(ident);
}

function addListener(el, action, fn){
	if (el.addEventListener) {
		el.addEventListener(action, fn, true);
	}
	else {
		el.attachEvent("on"+action, fn);
	}
}

function setupSubmitBid(formId, api){
	var element = $(formId);
	addListener(element, "submit", function(evt) {
		evt.preventDefault();
		submitBid(element, api);
	})
}

function check_required(firstName, lastName, description, bidAmount, emailAddress){
	var first = $(firstName).value.trim() != ''
	var last  = $(lastName).value.trim() != ''
	var desc  = $(description).value.trim() != ''
	var bid   = $(bidAmount).value.trim() != ''
	var email = $(emailAddress).value.trim() != ''
	if(!first)  $(firstName).parentElement.classList.add('is-invalid')
	if(!last)   $(lastName).parentElement.classList.add('is-invalid')
	if(!desc)   $(description).parentElement.classList.add('is-invalid')
	if(!bid)    $(bidAmount).parentElement.classList.add('is-invalid')
	if(!email)  $(emailAddress).parentElement.classList.add('is-invalid')

	return first&&last&&desc&&bid&&email
}

function submitBid(formElement, api){
	if(!check_required( "#pitcher-first-name", "#pitcher-last-name", "#description", "#bid-amount", "#pitcher-email")) return false;

	var user_id = $("#user-id").innerHTML;
	var user = $("#user-info").innerHTML;
	var bid = {
		"id": user_id,
		"pitcher_first_name": $("#pitcher-first-name").value,
		"pitcher_last_name": $("#pitcher-last-name").value,
		"pitcher_company_name": $("#pitcher-company-name").value,
		"pitcher_email": $("#pitcher-email").value,
		"description": $("#description").value,
		"bid_amount": parseFloat($("#bid-amount").value)
	}
	// get second page
	window.location.href = "/complete.html?bid="+btoa(JSON.stringify(bid))+"&user="+btoa(user);
}

function setup(api){
	getUserFrom(api);
	setupSubmitBid("#bid-form", api);
	setupDescriptionCharCountDisplay("#description", "#descriptionCharacterCount", "#descriptionCharacterCountContainer", 700);
}

function setupDescriptionCharCountDisplay(textAreaId, counter, container, max){
	addListener($(textAreaId), "keyup", function(evt) {
		var charCount = $(textAreaId).value.length;
		$(counter).innerHTML = charCount;
		if(charCount > max) $(container).classList.add("error");
		if(charCount <= max) $(container).classList.remove("error");
	})
}

function getUserFrom(api){
	console.log("ready to retrieve");
	url = window.location.href.split("/profile/");
	screen_name = url[url.length-1];
	axios
		.get(api+"/users/"+screen_name)
		.then(showUser)
		.catch(function(err){
			console.log('no user was found');
		})
}


function showUser(result){
	var user = result.data;

  try {
    $("#user-id").innerHTML=user.id
    $("#user-info").innerHTML=JSON.stringify(result);
  } catch(err){ }
	$("#user-name").innerHTML=user.first_name+" "+user.last_name;
	$("#user-avatar").src=(user.avatar_url || "/default.png");
	$("#email-domain").innerHTML=user.privatized_email;
	$("#user-bio").innerHTML=user.bio;
	$("#company-name").innerHTML=(user.companyName||"");
	//$("user-title").innerHTML=user.title
	var update_name = $(".substitute-variable")
	for(var i=0; i<update_name.length; i++){
		var body = update_name[i].innerHTML
		update_name[i].innerHTML = body.replace("{{user-first-name}}", user.first_name);
	}
}

function complete(api){
	url = window.location.href.split("?");
	queryString = url[url.length-1];
	entities = queryString.split("&");
	var elements = {};
	for(var i=0; i<entities.length; i++){
		var sep = entities[i].split("=");
		elements[sep[0]] = sep[1]
	}
	bid = JSON.parse(atob(elements.bid));
	showUser(JSON.parse(atob(elements.user)));
	axios.post(api+"/users/"+bid.id+"/pitch", bid)
	 .then(function(response){
			var pitchResponse = JSON.parse(response.data.pitch);
			console.log(pitchResponse);
			$("#pitcher-first-name").innerHTML=pitchResponse.pitcher_first_name
			$("#pitcher-last-name").innerHTML=pitchResponse.pitcher_last_name
			$("#pitcher-company-name").innerHTML=pitchResponse.pitcher_company_name
			$("#pitcher-email").innerHTML=pitchResponse.pitcher_email
			$("#description").innerHTML=pitchResponse.description
			$("#bid-amount").innerHTML=pitchResponse.bid_amount

			$("#bid-form-submit-pending").classList.add("hidden")
			$("#bid-form-submit-success").classList.remove("hidden")
		})
		.catch(function(err){
			console.log(err);
			$("#bid-form-submit-pending").classList.add("hidden")
			$("#bid-form-submit-failure").classList.remove("hidden")
		})
}

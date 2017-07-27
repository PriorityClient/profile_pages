//# PROFILE PAGES JAVASCRIPT DOCUMENTATION

// the profile pages application is a very simple
// vanilla javascript and html project. What follows
// is all of the javascript that runs the project's
// two (soon to be three) pages. They are split into sections:

// 1. Profile Page Functions - functions used only on the user profile page
// 2. Company Page Functions - functions used only on the company profile page
// 3. Bid Completion Page Functions - functions used only on the bid completion page
// 4. Shared Functions - display oriented functions used on more than one page
// 5. Helper Functions - a small library of functions intended to make jquery unnecessary


//## PROFILE PAGE FUNCTIONS

// the first function, setup, must choose whether we are
// currently looking at a profile or company page
// I realize this is gross, but it's easy and it works.
// Each page by itself is small enough that combining
// them into one page is still easily readable. In
// the long run, ideally this would be dealt with by a
// router at the server level so the whole project's
// html doesn't have to be in a single file, but
// for now this is the path. there are other solutions available.
function setup(api){
	var loc = window.location.href;
	if(loc.match(/\/profile\//))	return setupProfile(api)
	if(loc.match(/\/company\//))	return setupCompany(api)
}

// `setupProfile` initiates the user profile page
// Call out to the api, whose root address is passed in from
// the caller, prepare the submission form to prevent the
// html submission default behavior, and prepare the
// main pitch area to count the number of characters used
// in writing the pitch
function setupProfile(api){
	$("#profile-page").classList.remove("hidden");
	var url = window.location.href.split("/profile/");
	var screen_name = url[url.length-1];
	getUserFrom(api, screen_name);
	setupSubmitBid("#bid-form", api);
	setupDescriptionCharCountDisplay("#description", "#descriptionCharacterCount", "#descriptionCharacterCountContainer", 700);
}

// `getUserFrom` uses `axios` to retrieve the user
// from the api based on the screen name given.
// Once the information has been returned the
// information is displayed in the user's info card
// using the `showUser` method
function getUserFrom(api, screen_name){
	console.log("ready to retrieve");
	axios
		.get(api+"/users/"+screen_name)
		.then(showUser)
		.catch(function(err){
      console.log(err);
			console.log('no user was found');
		})
}

// `setupSubmitBid` is called from `setup` with an element ID
// and the path to the api. `setupSubmitBid` is intended to prevent
// the html submission default and then calls `submitBid` with
// the element found by the element ID passed in from `setup`
// as well as the location of the api
function setupSubmitBid(formId, api){
	var element = $(formId);
	addListener(element, "submit", function(evt) {
		evt.preventDefault();
		submitBid(element, api);
	})
}

// `setupDescriptionCharCountDisplay` is called from `setup` with the
// elements it is required to alter and track in order to display
// the current number of characters that have been added to the given
// text area. If the number of characters exceeds the given maximum,
// an error class is added to the counter's container
function setupDescriptionCharCountDisplay(textAreaId, counter, container, max){
	addListener($(textAreaId), "keyup", function(evt) {
		var charCount = $(textAreaId).value.length;
		$(counter).innerHTML = charCount;
		if(charCount > max) $(container).classList.add("error");
		if(charCount <= max) $(container).classList.remove("error");
	})
}

// `checkRequired` ensures that all required fields are filled in and
// invalidates those that aren't by adding an `is-invalid` class into
// the parent of those that are missing. The parent element is used
// because [that is where mdl reads the invalidation class](https://getmdl.io/components/index.html#textfields-section)
function checkRequired(firstName, lastName, description, bidAmount, emailAddress){
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

// `submitBid` bundles the values in the form that is passed in as an
// object, grabs the user's info that is currently stored in html,
// and puts both of those as base64 encoded query string variables
// before sending the form to the submission completion page
function submitBid(formElement, api){
	if(!checkRequired( "#pitcher-first-name", "#pitcher-last-name", "#description", "#bid-amount", "#pitcher-email")) return false;

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

//## COMPANY PROFILE PAGE FUNCTIONS

// `setupCompany` retrieves the company information from the
// api, and then call the function to show
// the company's information on the page
function setupCompany(api){
	$("#company-page").classList.remove("hidden");
	var url = window.location.href.split("/company/");
	var company_name = url[url.length-1];
	axios
		.get(api+"/enterprises/"+company_name)
		.then(showCompany)
		.catch(function(err){
			console.log(err);
		})
}

// `showCompany` determines the company name and list of employees,
// and then generates that list of employees as HTML. This is done
// by retrieving the HTML for a sample element from within the page,
// and then appending a duplication of that with alterations for the
// given user within the unordered list element that contains all employees
function showCompany(result){
	var employees   = result.data.employees;
	var companyName = result.data.enterprise.name;
	var sample = $("#company-user-example")
	for(var i=0; i<employees.length; i++){
		var user = employees[i];
		var userEl = sample.cloneNode(true)
		userEl.id = '';
		userEl.classList.remove('hidden');
		var avatar = user.avatar_thumbnail_url || "/default_sm.png";
		var userName = user.first_name +" "+ user.last_name;
		var userId = user.id;
		var job_desciption = user.job_description||'[ no job description given ]';
		var job_title = user.job_title||'[ no job title given ]';
		var min_bid = user.bid_amount||'30.00';
		$("#company-user-list").insertAdjacentHTML('beforeend',
			userEl
				.outerHTML
				.replace(new RegExp("{{{userId}}}", 'g'), userId)
				.replace(new RegExp("{{{userName}}}", 'g'), userName)
				.replace(new RegExp("{{{avatar}}}", 'g'), avatar)
				.replace(new RegExp("{{{jobDescription}}}", 'g'), job_desciption)
				.replace(new RegExp("{{{jobTitle}}}", 'g'), job_title)
				.replace(new RegExp("{{{minBid}}}", 'g'), min_bid)
		)

	}
	$("#company-name").innerHTML = companyName;
}

//## BID COMPLETION PAGE FUNCTIONS

// `complete` is run on page load of `complete.html`. It retrieves
// the pitch submission and user object from the query string as
// bundled by the `submitBid` function. Show the user data in the
// user info card, post the bid to the api, and display
// an error message if something goes wrong. There is a `pending`
// class that is removed after the response from the pitch
// has been put into the HTML for display
function complete(api, stripeKey){
	url = window.location.href.split("?");
	queryString = url[url.length-1];
	entities = queryString.split("&");
	var elements = {};
	for(var i=0; i<entities.length; i++){
		var sep = entities[i].split("=");
		elements[sep[0]] = sep[1]
	}
	bid = JSON.parse(atob(elements.bid));
  user = JSON.parse(atob(elements.user));
	showUser(user);
	axios.post(api+"/users/"+bid.id+"/pitch", bid)
	 .then(function(response){
			var pitchResponse = response.data.pitch;
			$("#pitcher-first-name").innerHTML=pitchResponse.pitcher_first_name
			$("#pitcher-last-name").innerHTML=pitchResponse.pitcher_last_name
			$("#pitcher-company-name").innerHTML=pitchResponse.pitcher_company_name
			$("#pitcher-email").innerHTML=pitchResponse.pitcher_email
			$("#description").innerHTML=bid.description
			$("#bid-amount").innerHTML=pitchResponse.bid_amount

      setupStripe(api, stripeKey, pitchResponse);

			$("#bid-form-submit-success").classList.remove("pending")
		})
		.catch(function(err){
			console.log(err);
			$("#bid-form-submit-success").classList.add("hidden")
			$("#bid-form-submit-failure").classList.remove("hidden")
		})
}

function setupStripe(api, stripeKey, pitch){
  var handler = StripeCheckout.configure({
    key: stripeKey,
    image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
    locale: 'auto',
    token: function(token) {
      var paymentInfo = {
        token: token,
        pitchEid: pitch.id
      };
      axios.post(api+"/stripe_payments", paymentInfo);
    }
  });

  $('customButton').addEventListener('click', function(e) {
    // Open Checkout with further options:
    handler.open({
      zipCode: false,
      email: pitch.pitcher_email,
      amount: 8000
    });
    e.preventDefault();
  });

  // Close Checkout on page navigation:
  window.addEventListener('popstate', function() {
    handler.close();
  });
}

//## SHARED FUNCTIONS

// `showUser` displays the given user information in the
// user info card. This is used on both the user pitch page
// and the completion page. `showUser` also replaces the
// user's first name in several pages around the page by
// searching for the `substitute-variable` class and then
// replacing {{user-first-name}} for the user's first name
function showUser(result){
	var user = result.data;

  try {
    $("#user-id").innerHTML=user.id
    $("#user-info").innerHTML=JSON.stringify(result);
  } catch(err){ /* completion page does not have these elements */ }

console.log(user.enterprise_id);
	$("#sidebar-company-name").href="/company/"+user.enterprise_id;
	$("#sidebar-company-name").innerHTML=(user.company_name||user.enterprise_id||"");
	$("#user-name").innerHTML=user.first_name+" "+user.last_name;
	$("#user-avatar").src=(user.avatar_url || "/default.png");
	$("#user-job-description").innerHTML=user.job_description;
	$("#user-email-domain").innerHTML=user.privatized_email;
	$("#job-title").innerHTML=user.job_title
	var update_name = $(".substitute-variable")
	for(var i=0; i<update_name.length; i++){
		var body = update_name[i].innerHTML
    var regex = new RegExp("{{user-first-name}}", "g")
		update_name[i].innerHTML = body.replace(regex, user.first_name);
	}
}

//## HELPER FUNCTIONS

// $ is a mini-jquery substitute that does very little.
// if the passed argument starts with a `#` and does not
// contain a `.`, the element is found by ID and a single
// element is returned.

// if the passed argument starts with a `.`, the element
// is found by class, and a list of elements is returned

// if the passed argument does not abide by one of those
// conditions, the element is found by query selector and
// a list of elements is returned
function $(id){
	var ident = id.slice(1);
	if(id.match(/^\#[^\.]*$/)) return document.getElementById(ident);
	if(id.match(/^\.[^\#]*$/)) return document.getElementsByClassName(ident);
	return document.querySelectorAll(ident);
}

// `addListener` cuts down on the boilerplate of adding
// an event listener and watching out for older browsers
// a very naive implementation, but seems to work
// for our purposes
function addListener(el, action, fn){
	if (el.addEventListener) {
		el.addEventListener(action, fn, true);
	}
	else {
		el.attachEvent("on"+action, fn);
	}
}

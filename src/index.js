//# PROFILE PAGES JAVASCRIPT DOCUMENTATION

// the profile pages application is a very simple
// vanilla javascript and html project. What follows
// is all of the javascript that runs the project's
// two (soon to be three) pages. They are split into sections:

// 1. Installation and Usage for Development
// 2. Staging and Production Deployment Instructions
// 3. Project Structure and Libraries
// 4. Profile Page Functions - functions used only on the user profile page
// 5. Company Page Functions - functions used only on the company profile page
// 6. Bid Completion Page Functions - functions used only on the bid completion page
// 7. Shared Functions - display oriented functions used on more than one page
// 8. Helper Functions - a small library of functions intended to make jquery unnecessary


//## INSTALLATION AND USAGE FOR DEVELOPMENT

//```
//  git clone https://github.com/PriorityClient/profile_pages.git
//  npm install
//  npm start
//```

//## STAGING AND PRODUCTION DEPLOYMENT INSTRUCTIONS

// AWS Codebuild is used to deploy these projects
// The instructions for how the Codebuild service interracts
// with this project can be seen in buildspec.yml
// further information on the buildspec.yml file can be seen here
// http://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html

// To deploy go to the link that corresponds to the environment you are deploying
// and click `start build`. No further action is required. Deploys are very fast,
// but take a few minutes to show up because of cache invalidations.

// Staging Deploy:
// https://console.aws.amazon.com/codebuild/home?region=us-east-1#/projects/ProfilePages/view

// Production Deploy:
// https://console.aws.amazon.com/codebuild/home?region=us-east-1#/projects/Production-ProfilePages/view

//## PROJECT STRUCTURE AND LIBRARIES

// The project has 2 HTML (`index.html` and `complete.html`) pages which each
// have their own CSS defined in the head, the majority of which is duplicated on both pages.

// `index.html` is both the company listing and profile page. The elements for each of these are
// `#company-page` and `#profile-page` respectively. This does mean that some care has
// to be taken in using IDs that may be appropriate in both places

// `complete.html` shows a success message if the pitch was successfully sent. Unsuccessful
// pitches do not leave the form page

// a few libraries are used, all of which are currently loaded via CDN

// MDL - Material Design Light, the wonderful style package which made this whole thing possible
// https://code.getmdl.io

// Axios - a simple promise-based cross-browser library for ajax requests
// https://www.npmjs.com/package/axios

// stripe checkout for desktop, stripe v3 api for mobile
// stripe.com

// randomcolor for generating default background images
// https://github.com/davidmerfield/randomColor

//## PROFILE PAGE FUNCTIONS

// the first function, setup, must choose whether we are
// currently looking at a profile or company page.
// A simple router for a simple situation
function setup(api, emailDomain, stripeKey, altDomain){
	var loc = window.location.href;
	if(loc.match(/\/company\//))	return setupCompany(api)
	if(loc.match(/https?:\/\/[^\/]+\/.+$/))	return setupProfile(api, emailDomain, stripeKey) // https?:\/\/[^\/]+\/[^\/]+\/?$

	window.location.href = altDomain;
}

// `setupProfile` initiates the user profile page
// Call out to the api, whose root address is passed in from
// the caller, prepare the submission form to prevent the
// html submission default behavior, and prepare the
// main pitch area to count the number of characters used
// in writing the pitch
function setupProfile(api, emailDomain, stripeKey){
	$("#profile-page").classList.remove("hidden");
	var url = window.location.href.split("/");
	var screen_name = url[url.length-1];
  addListener($("#tos-checkbox"), "click", function(){ setCheckboxError("#tos-checkbox") });
	getUserFrom(api, screen_name)
    .then(function(u){
      $("#bid-amount").parentElement.classList.add("is-dirty");
      setupStripe(api, emailDomain, u, stripeKey);
      var update_name = $(".substitute-minimum-bid")
      for(var i=0; i<update_name.length; i++){
        var body = update_name[i].innerHTML
        var min_bid_regex = new RegExp("{{user-minimum-bid}}", "g")
        update_name[i].innerHTML = body.replace(min_bid_regex, parseFloat(u.minimum_bid).toFixed(2));
      }
    });
	setupDescriptionCharCountDisplay("#description", "#descriptionCharacterCount", "#descriptionCharacterCountContainer", 700);
}


// `setCheckboxError` manages the error state of the TOS checkbox
// because MDL doesn't seem to want to do it for me
function setCheckboxError(tosCheckbox){
	var tos     = $(tosCheckbox).checked
	if(!tos)  $(tosCheckbox).parentElement.classList.add('error')
      else  $(tosCheckbox).parentElement.classList.remove('error')
  return tos
}

// `getUserFrom` uses `axios` to retrieve the user
// from the api based on the screen name given.
// Once the information has been returned the
// information is displayed in the user's info card
// using the `showUser` method
function getUserFrom(api, screen_name){
	console.log("ready to retrieve");
	return axios
		.get(api+"/users/"+screen_name)
		.then(showUser)
		.catch(function(err){
      console.log(err);
			console.log('no user was found');
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
function checkRequired(firstName, lastName, description, bidAmount, emailAddress, companyName, tosCheckbox, user){
	var first = $(firstName).value.trim() != ''
	var last  = $(lastName).value.trim() != ''
	var desc  = $(description).value.trim() != '' && $(description).value.length < 700
	var bid   = $(bidAmount).value.trim() != '' && user.minimum_bid <= parseFloat($(bidAmount).value)
	var email = $(emailAddress).value.trim() != ''
	var company = $(companyName).value.trim() != ''
	if(!first)  $(firstName).parentElement.classList.add('is-invalid')
	if(!last)   $(lastName).parentElement.classList.add('is-invalid')
	if(!desc)   $(description).parentElement.classList.add('is-invalid')
	if(!bid)    $(bidAmount).parentElement.classList.add('is-invalid')
	if(!email)  $(emailAddress).parentElement.classList.add('is-invalid')
	if(!company)  $(companyName).parentElement.classList.add('is-invalid')

	return first&&last&&desc&&bid&&email&&company&&setCheckboxError(tosCheckbox)
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
  if(!user.avatar_thumbnail_url){
    userEl.querySelector(".user-avatar").innerHTML= user.first_name.charAt(0)+user.last_name.charAt(0);
    userEl.querySelector(".user-avatar").style.backgroundColor = randomColor({seed: user.id, luminosity: 'bright'});
  }else{
    userEl.querySelector(".user-avatar").insertAdjacentHTML('afterbegin', '<img src="'+user.avatar_large_url+'" />');
    userEl.querySelector(".user-avatar").style['line-height'] = 1;

  }

	var userName = user.first_name +" "+ user.last_name;
	var userId = user.id;
	var userScreenName = user.screen_name;
	var job_desciption = user.job_description||'[ no job description given ]';
	var job_title = user.job_title||'[ no job title given ]';
	var min_bid = (user.minimum_bid&&user.minimum_bid.toFixed(2))||'30.00';

  var chips = '';
  for(var j=0; j<user.responsibilities.length; j++){
    chips += '<span class="mdl-chip"> <span class="mdl-chip__text">'+user.responsibilities[j].name+'</span> </span> '
  }

  userEl.querySelector(".involved-in-container").insertAdjacentHTML('beforeend', chips)
	$("#company-user-list").insertAdjacentHTML('beforeend',
			userEl
				.outerHTML
				.replace(new RegExp("{{{userId}}}", 'g'), userId)
				.replace(new RegExp("{{{userScreenName}}}", 'g'), userScreenName)
				.replace(new RegExp("{{{userName}}}", 'g'), userName)
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
function complete(api, emailDomain, stripeKey){
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
	var update_name = $(".substitute-variable")
	for(var i=0; i<update_name.length; i++){
		var body = update_name[i].innerHTML
    var regex =
		update_name[i].innerHTML = body.replace(new RegExp("{{pitcher-email}}", "g"), bid.pitcher_email)
.replace(new RegExp("{{charge-id}}", "g"), elements.charge);
	}
	console.log(bid)
	console.log(user)
  showUser(user);
}



// `setupStripe` pulls double-duty setting up both the
// phone/tablet stripe payments element and the desktop
// stripe checkout element
function setupStripe(api, emailDomain, user, stripeKey){

	// the majority of this function was lifted from the stripe
	// documentation https://stripe.com/docs/elements
	var stripe = Stripe(stripeKey);
	var elements = stripe.elements();
	var style = {
		base: {
			// Add your base input styles here. For example:
			fontSize: '16px',
			lineHeight: '24px'
		}
	};
	var card = elements.create('card', {style: style});

	// Add an instance of the card Element into the `card-element` <div>
	card.mount('#card-element');
	card.addEventListener('change', function(event) {
		var displayError = document.getElementById('card-errors');
		if (event.error) {
			displayError.textContent = event.error.message;
		} else {
			displayError.textContent = '';
		}
	});
	$("#main-form").addEventListener('submit', function(e){
		e.preventDefault();
				if(!checkRequired( "#pitcher-first-name", "#pitcher-last-name", "#description", "#bid-amount", "#pitcher-email", "#pitcher-company-name", "#tos-checkbox", user)) return false;
		stripe.createToken(card).then(function(result) {
			if (result.error) {
				// Inform the user if there was an error
				var errorElement = document.getElementById('card-errors');
				errorElement.textContent = result.error.message;
			} else {
				// Send the token to your server
				stripeHandler(result.token, user, api);
			}
		});
	})

	var handler = StripeCheckout.configure({
		key: stripeKey,
		image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
		locale: 'auto',
		token: function(token){ stripeHandler(token, user, api) }
	});

	// This section sets up the stripe checkout on desktop
	$('#stripe-button').addEventListener('click', function(e) {
		// Open Checkout with further options:
		if(!checkRequired( "#pitcher-first-name", "#pitcher-last-name", "#description", "#bid-amount", "#pitcher-email", "#pitcher-company-name", "#tos-checkbox", user)) return false;

		handler.open({
			zipCode: false,
			email: $("#pitcher-email").value,
			amount: 800,
			image: "/logo-icon.png",
			name: "Pay $8 Now",
			description: "Remainder when call is completed"//,
			//panelLabel: "Submit"

		});
		e.preventDefault();
	});

		// Close Checkout on page navigation:
	window.addEventListener('popstate', function(result) {
		console.log(result);
		handler.close();
	});
}

// `stripeHandler` is called after a stripe payment has been
// successfully processed (on both mobile/tablet and desktop)
// This function posts the completed information to the api
// and then base64 encodes the necessary information for the
// completion page, adds it to the query string, and then
// forwards to `complete.html`
function stripeHandler(token, user, api) {
	$("#stripe-button").disabled = true;
	$("#main-form").classList.add("pending");
	$("#progress-bar").classList.remove("hidden");
	var bid = getBid()
	var paymentInfo = {
		token: token,
		pitch: bid
	};
	axios
		.post(api+"/stripe_payments", paymentInfo)
		.then(function(payment){
			window.location.href = "/complete.html?bid="+btoa(JSON.stringify(Object.assign({}, bid, {pitch_id: payment.data.pitch.id})))+"&user="+btoa(JSON.stringify(user))+"&charge="+payment.data.charge;
		})
		.catch(function(error){
console.log(error);
			$("#progress-bar").classList.add("hidden");
			$("#main-form").classList.remove("pending");
			$("#stripe-button").disabled = false;
			$("#stripe-response").innerHTML = "Something has gone wrong with sending your pitch. The developers at VIP Crowd have been made aware of the issue. You may try again, or contact support@vipcrowd.com for more information"
			$("#stripe-response").classList.add("failure-message");
			$("#stripe-response").classList.remove("hidden");
		});
}

// `getBid` retrieves bid information from the form for packaging for the completion page
function getBid(){
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
	return bid
}

//## SHARED FUNCTIONS

// `showUser` displays the given user information in the
// user info card. This is used on both the user pitch page
// and the completion page. `showUser` also replaces the
// user's first name in several pages around the page by
// searching for the `substitute-variable` class and then
// replacing {{user-first-name}} for the user's first name
function showUser(result){
	var user = result.data||result;
console.log(user.id);

  try {
    $("#user-id").innerHTML=user.id
    $("#user-info").innerHTML=JSON.stringify(result);
  } catch(err){ /* completion page does not have these elements */ }

	$("#sidebar-company-name").href="/company/"+user.enterprise_id;
	$("#sidebar-company-name").innerHTML=(user.company_name||user.enterprise_id||"");
	$("#user-name").innerHTML=user.first_name+" "+user.last_name;
  if(!user.avatar_url){
    $("#user-avatar").innerHTML=user.first_name.charAt(0)+user.last_name.charAt(0);
    $("#user-avatar").style.backgroundColor = randomColor({seed: user.id, luminosity: 'bright'});
  }else{
    $("#user-avatar").insertAdjacentHTML('afterbegin', '<img src="'+user.avatar_url+'" />');
    $("#user-avatar").style['line-height'] = 1;

  }
	$("#user-job-description").innerHTML=user.job_description;
	$("#user-email-domain").innerHTML=user.privatized_email;
	$("#job-title").innerHTML=user.job_title
	var update_name = $(".substitute-variable")
	for(var i=0; i<update_name.length; i++){
		var body = update_name[i].innerHTML
    var regex = new RegExp("{{user-first-name}}", "g")
		update_name[i].innerHTML = body.replace(regex, user.first_name);
	}
  showChips(user.responsibilities)
  return user;
}

// `showChips` displays a client's interests as chips in the profile panel
// at the top left of both the profile page and the completion page
function showChips(interests){
  if(!interests.length) return false ;
  $("#no-interests").classList.add("hidden");
	var sample = $("#chip-example")
	for(var i=0; i<interests.length; i++){
		var interest = interests[i];
		var interestEl = sample.cloneNode(true)
		interestEl.removeAttribute('id');
		interestEl.classList.remove('hidden');
		$("#interest-container").insertAdjacentHTML('afterbegin',
			interestEl
				.outerHTML
				.replace(new RegExp("{{{interestName}}}", 'g'), interest.name)+" "
		)

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

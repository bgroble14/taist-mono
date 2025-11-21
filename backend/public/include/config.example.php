<?php
	date_default_timezone_set('America/Los_Angeles');
	// date_default_timezone_set('Asia/Karachi');

	$serverURL = "./";
	$url = $_SERVER['REQUEST_URI'];
	if (count(explode('/', $url)) > 3) {
		$serverURL = "../";
	}

	$database = array(
		'host' => 'localhost',
		'db' => 'taist-main',
		'user' => 'root',
		'pass' => 'YOUR_DATABASE_PASSWORD'
	);

	$title = "Taist";
	$stripe_key = "YOUR_STRIPE_SECRET_KEY";
	
	$Twilio_AccountSid = "YOUR_TWILIO_ACCOUNT_SID";
	$Twilio_AuthToken = "YOUR_TWILIO_AUTH_TOKEN";
	$Twilio_phone = "YOUR_TWILIO_PHONE";

	$sendgrid_key="YOUR_SENDGRID_API_KEY";

	$limit = 5;
	
	
	$SafeScreenerGUID = "YOUR_SAFESCREENER_GUID";
	$SafeScreenerPassword = "YOUR_SAFESCREENER_PASSWORD";
	$SafeScreenerPackage = "YOUR_SAFESCREENER_PACKAGE";
	
?>


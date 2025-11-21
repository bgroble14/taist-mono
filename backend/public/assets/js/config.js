function getPhotoURL($url, $is_photo = 0) {
    if ($url == "") {
        if ($is_photo == 1)
            return '/assets/images/profile.png';
        return '/assets/images/photo_frame.png';
    }
    return '/assets/uploads/images/' + $url;
}
function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign +
            (j ? i.substr(0, j) + thousands : '') +
            i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
            (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
        return amount;
    }
};
function cardType(number) {
    // visa
    var re = new RegExp("^4");
    if (number.match(re) != null)
        return "visa";

    // Mastercard 
    // Updated for Mastercard 2017 BINs expansion
    if (/^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/.test(number))
        return "mastercard";

    // AMEX
    re = new RegExp("^3[47]");
    if (number.match(re) != null)
        return "american";

    // Discover
    re = new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)");
    if (number.match(re) != null)
        return "discover";

    // Visa Electron
    re = new RegExp("^(4026|417500|4508|4844|491(3|7))");
    if (number.match(re) != null)
        return "visa";//"Visa Electron";

    /*
    // Diners
    re = new RegExp("^36");
    if (number.match(re) != null)
        return "Diners";
  
    // Diners - Carte Blanche
    re = new RegExp("^30[0-5]");
    if (number.match(re) != null)
        return "Diners - Carte Blanche";
  
    // JCB
    re = new RegExp("^35(2[89]|[3-8][0-9])");
    if (number.match(re) != null)
        return "JCB";
    */

    return "other_card";
}

// ================== configuration variables ==================

// var stripe_key = 'pk_live_51KWXqKKujvfsOOCM9AOP40oBdH9RxKdL2o5DM5F3dsxFJfuyeo4LmsVxkDQIAmeXJmEt55fFyQTni8CO8qWMQsGo000AuSlz7G';
var stripe_key = 'pk_test_51KWXqKKujvfsOOCM7ZW1LSWIwvGfwx7D2iLN0SHjerkhMHTlAuTBDacSbR7ayZRg1ds9WNIXXemf6Kf4eF8bjv9O00TYxsJNqs';


function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);

    var dDisplay = d > 0 ? d + (d == 1 ? "d " : "d ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? "h " : "h ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? "m " : "m ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? "s" : "s") : "";
    return dDisplay + hDisplay + mDisplay;
}
function ajaxPost(url, data, errorObj=null, callback=null, loader=true, loader_text='') {
	sUrl = serverURL + "api/" + url + ".php";
	var form_data = new FormData();  
    form_data.append('data', JSON.stringify(data));
    if (errorObj && errorObj!='errordlg') 
        errorObj.html('');
    if (loader)
        showLoading(loader_text);
    $.ajax({
        type: "POST",
        url: sUrl,
        cache: false,
        processData: false, 
        contentType: false,
        data: form_data,
        success: function(res) {
            hideLoading();
	        if (res.success*1 == 0) {
	        	if (errorObj) {
                    if (errorObj == 'errordlg') {
                        showAlert(res.msg);
                    } else {
	            	  errorObj.html(res.msg);
                    }
                }
	            return;
	        }
	        if (callback)
            	callback(res);
        },
        error: function() {
            hideLoading();
            if (errorObj)
            	errorObj.html("Error in server.");
            return;
        },
        dataType: 'json'
    });
}
function ajaxPostRaw(url, form_data, errorObj=null, callback=null, loader=true, loader_text='') {
    sUrl = serverURL + "api/" + url + ".php";
    if (errorObj && errorObj!='errordlg') 
        errorObj.html('');
    if (loader)
        showLoading(loader_text);
    $.ajax({
        type: "POST",
        url: sUrl,
        cache: false,
        processData: false, 
        contentType: false,
        data: form_data,
        success: function(res) {
            hideLoading();
            if (res.success*1 == 0) {
                if (errorObj) {
                    if (errorObj == 'errordlg') {
                        showAlert(res.msg);
                    } else {
                      errorObj.html(res.msg);
                    }
                }
                return;
            }
            if (callback)
                callback(res);
        },
        error: function() {
            hideLoading();
            if (errorObj)
                errorObj.html("Error in server.");
            return;
        },
        dataType: 'json'
    });
}
function getDateTime(date) {
    d = date*1000;
    date = new Date(d);
    now = new Date(d);
    // now.setHours(now.getHours()+2);
    var isPM = now.getHours() >= 12;
    var isMidday = now.getHours() == 12;
    h = date.getHours() - (isPM && !isMidday ? 12 : 0);
    m = date.getMinutes();
    if (h<10 ) h = '0'+h;
    if (m<10 ) m = '0'+m;
    var time = [h,m].join(':') +
           (isPM ? ' pm' : 'am');
    var ms = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return ms[date.getMonth()] + ' '+ (date.getDate()<10?'0'+date.getDate():date.getDate()) + ', '+ date.getFullYear() + ' - ' + time;
}
function dateFormat(d) {
    d = d*1000;
    return moment(d).format('DD MMMM YYYY');
}
function validEmail(email) {
	let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
	return EMAIL_REGEXP.test(email);
}

function showLoading(title='') {
    $('.loading_title').html(title);
	$('.div_loading').css('display', 'flex');
}
function hideLoading() {
	$('.div_loading').fadeOut();
}
function showSuccess(message) {
    $('.success_message').html(message);
    $('#dlg_success').css('display', 'flex');

    $('#dlg_success .bt').unbind('click');
    $('#dlg_success .bt_eok').click(function() {
        $('#dlg_success').hide();
    })
}
function showAlert(message) {
    $('.error_message').html(message);
    $('#dlg_error').css('display', 'flex');

    $('#dlg_error .bt').unbind('click');
    $('#dlg_error .bt_eok').click(function() {
        $('#dlg_error').hide();
    })
}
function showToast(msg, duration=3000) {
    $('.toast div').html(msg);
    $('.toast').addClass('open');
    setTimeout(() => {
        $('.toast').removeClass('open');
    }, duration)
}
function showConfirm(title='',message='', callback=null) {
    $('.confirm_message').html(message);
    $('#dlg_confirm').css('display', 'flex');

    $('#dlg_confirm .bt').unbind('click');
    $('#dlg_confirm .bt_ccancel').click(function() {
        $('#dlg_confirm').hide();
    })
    $('#dlg_confirm .bt_cconfirm').click(function() {
        $('#dlg_confirm').hide();
        if (callback) {
            callback();
        }
    })
}
function getNum(num) {
    return Math.round(num*100)/100;
}
function getStripText(str) {
    return str.replace(/(<([^>]+)>)/gi, "");
}
function getCount(nums) {
    nums = nums * 1;
    if (nums >= 1000000) {
        nums = Math.round(nums/1000000 * 10) / 10;
        return nums+'M';
    }
    if (nums >= 1000) {
        nums = Math.round(nums/1000 * 10) / 10;
        return nums+'K';
    }
    if (nums < 1000)
        return nums;
    return nums;
}
function getBadge(d) {
    d = d*1;
    if (d <=0) d = 0;
    else if (d < 5) d = 1;
    else if (d < 10) d = 2;
    else if (d < 25) d = 3;
    else if (d >= 25) d = 4;
    return "../images/badge_"+d+".png";
}
function onGoogleSignIn(response) {
    const user = jwt_decode(response.credential);
    data = {
        email: user.email,
        type: 1,
        photo: user.picture,
        name: user.given_name + ' ' + user.family_name
    }
    $('#social_info').val(JSON.stringify(data));
    $('#social_login_form').submit();
}
function socialLogin(l_type) {
    var provider;
    if (l_type == 'google')
        provider = new firebase.auth.GoogleAuthProvider();
    else if (l_type == 'apple') {
        provider = new firebase.auth.OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
    }
    firebase.auth().signInWithPopup(provider).then((result) => {
        var credential = result.credential;
        var token = credential.accessToken;
        var user = result.user;
        data = {
            email: user.email,
            type: l_type == 'google' ? 1 : 2,
            photo: user.photoURL,
            name: user.displayName
        }
        $('#social_info').val(JSON.stringify(data));
        $('#social_login_form').submit();
    }).catch((error) => {
        errorMessage = error.message;
        // console.log(error);
    });
}
$(function() {
    $('.m_nav').click(function() {
        $('.side_menu').toggleClass('open')
    })
    $('#btn-chefs').click(function() {
        $('.sub_chefs').toggleClass('sub_menu1');
        $('.toggle-arrow').toggleClass('open');
    })
    $('.bt_cancel').click(function() {
        $('.dlg').hide();
    })
    $('.my_account').click(function() {
        $(this).toggleClass('sel');
    })
    $('body').click(function(e) {
        obj = $(e.target);
        text = obj.text();
        if (obj.hasClass('my_account') || text == 'MY ACCOUNT' || obj.hasClass('fa fa-caret-down')) {
        } else {
            $('.my_account').removeClass('sel');
        }
    })
    if ($(window).width() < 768) {
        $('#menu_bar').click(function(e) {
            e.preventDefault();
            $('.banner_menu').toggleClass('m_open');
        })
    }
    setTimeout(() => {
        $('.g_id_signin > div').hover(function() {
            $(this).parent().next().addClass('sel');
        }, function() {
            $(this).parent().next().removeClass('sel');
        })  
    }, 1000)

    $('.change_my_password').click(function() {
        $('.div_current_password').show();
        $('#dlg_change').css('display', 'flex');
        $('#dlg_change input').val('');
        $('#dlg_change .bt_cchange').attr('id', $(this).attr('id'));
    })
    $('#dlg_change .bt_ccancel').click(function() {
        $('#dlg_change').hide();
    })
    $('#dlg_change .bt_cchange').click(function() {
        if ($('.div_current_password').css('display') != 'none') {
           if ($('#old_password').val() == "") {
              $('#old_password').focus();
              return;
           }
        }
        if ($('#newpassword').val() == "") {
           $('#newpassword').focus();
           return;
        }
        if ($('#newpassword').val() != $('#newpassword1').val()) {
           $('#dlg_change .error').html("Please confirm your password.");
           $('#newpassword1').focus();
           return;
        }
        var form_data = new FormData();
        if ($('.div_current_password').css('display') != 'none') 
           form_data.append('oldpassword', $('#old_password').val());
        form_data.append('password', $('#newpassword').val());
        form_data.append('id', $(this).attr('id'));
        $.ajax({
             type: "POST",
             url: '/adminapi/reset_password',
             cache: false,
             processData: false, 
             contentType: false,
             headers: { 'Authorization': 'Bearer '+token},
             data: form_data,
             success: function(res) {
                 if (res.success*1 == 1) {
                    $('#dlg_change').hide();
                    showSuccess("The password has been changed successfully.");
                 } else {
                    $('#dlg_change .error').html(res.error);
                 }
             },
             error: function() {
             },
             dataType: 'json'
        });
    })
})
window.Clipboard = (function(window, document, navigator) {
    var textArea,
        copy;

    function isOS() {
        return navigator.userAgent.match(/ipad|iphone/i);
    }

    function createTextArea(text) {
        textArea = document.createElement('textArea');
        textArea.value = text;
        document.body.appendChild(textArea);
    }

    function selectText() {
        var range,
            selection;

        if (isOS()) {
            range = document.createRange();
            range.selectNodeContents(textArea);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            textArea.setSelectionRange(0, 999999);
        } else {
            textArea.select();
        }
    }

    function copyToClipboard() {        
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    copy = function(text) {
        createTextArea(text);
        selectText();
        copyToClipboard();
    };

    return {
        copy: copy
    };
})(window, document, navigator);

function ClipboardCopy(ctext) {
    var type = 'text/plain';
    // const clipboardItem = new ClipboardItem({
    //     'text/plain': someAsyncMethod().then((result) => {
    //     if (!result) {
    //         return new Promise(async (resolve) => {
    //             resolve(new Blob[``]())
    //         })
    //     }

    //     const copyText = ctext
    //         return new Promise(async (resolve) => {
    //             resolve(new Blob([copyText]))
    //         })
    //     }),
    // })
    // // Now, we can write to the clipboard in Safari
    // navigator.clipboard.write([clipboardItem])

    const makeImagePromise = async () => {
        return new Promise(async (resolve) => {
            resolve(new Blob([ctext], { type }))
        })
    }
    var blob = new Blob([ctext], { type });
    var cdata = [new ClipboardItem({ "text/plain": makeImagePromise() })];
    // var cdata = [new ClipboardItem({ [type]: blob })];
    navigator.clipboard.write(cdata)
      .then(function () { console.log('copied'); })
      .catch(function (error) { console.log(error); });
    
}
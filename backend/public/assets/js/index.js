$(function() {
	$('#bt_login').click(function() {
		if (!validEmail($('#email').val())) {
			$('.div_login .error').html("Email is not valid, please try again.");
			$('#email').focus();
			return;
		}
		if ($('#password').val() == "") {
			$('.div_login .error').html("Please enter your password.");
			$('#password').focus();
			return;
		}
		$('#login_form').submit();
	})
	$('#bt_forgot').click(function() {
		if (!validEmail($('#email').val())) {
			$('.div_login .error').html("Email is not valid, please try again.");
			$('#email').focus();
			return;
		}
		$('#reset_form').submit();
	})
	$('#bt_reset').click(function() {
		if ($('#password').val() == "") {
			$('.div_login .error').html("Please enter a new password.");
			$('#password').focus();
			return;
		}
		if ($('#password').val() != $('#password_confirmation').val()) {
			$('.div_login .error').html("Please confirm your password.");
			$('#password_confirmation').focus();
			return;
		}
		$('#reset_form').submit();
	})

	$('#bt_signup').click(function() {
		if ($('#first_name').val().trim() == "") {
			$('#first_name').focus();
			return;
		}
		if ($('#last_name').val().trim() == "") {
			$('#last_name').focus();
			return;
		}
		// if ($('#company').val().trim() == "") {
		// 	$('#company').focus();
		// 	return;
		// }
		if (!validEmail($('#email').val())) {
			$('.div_signup .error').html("Email is not valid, please try again.");
			$('#email').focus();
			return;
		}
		if ($('#password').val() == "") {
			$('.div_signup .error').html("Please enter your password.");
			$('#password').focus();
			return;
		}
		if ($('#password').val() != $('#password_confirmation').val()) {
			$('.div_signup .error').html("Please confirm your password.");
			$('#password_confirmation').focus();
			return;
		}
		if (!$('#chkterms').prop('checked')) {
			$('.div_signup .error').html("Please accept our Terms and Privacy policy.");
			return;
		}
		$('#signup_form').submit();
	})
	$('.bt_login_google').click(function() {
		socialLogin('google');
	})
	$('.bt_login_apple').click(function() {
		socialLogin('apple');
	})
	$('#email').keypress(function(e) {
	    if(e.which == 13) {
	        $('#password').focus();
	    }
	});
	$('#password').keypress(function(e) {
	    if(e.which == 13) {
	        $('#bt_login').click();
	    }
	});
	$('#password_confirmation').keypress(function(e) {
	    if(e.which == 13) {
	        $('#bt_signup').click();
	    }
	});
	$('.eye').click(function() {
		if ($(this).attr('id') == 'eye') {
			$('#eye_show').show();
			$('#eye').hide();
			$('#password').attr('type', 'text');
		} else {
			$('#eye_show').hide();
			$('#eye').show();
			$('#password').attr('type', 'password');
		}
	})

	$('#search').keyup(function() {
		str = $(this).val();
		$('.search_result').hide();
		if (str.length >= 3) {
			clearTimeout(timer);
			timer = setTimeout(() => {
				s_page = 1;
				search(str);
			}, 500)
		}
	})
	$('.search_close').click(function() {
		$('.search_result').hide();
		$('#search').val('');
	})
})

var b_page = 1;
var s_page = 1;
var list = [];
var timer;

function search(str) {
	$('.search_result').show();
	if (s_page == 1) {
		$('.search_cont').html(`<div class='brands'></div><div class='styles'></div>`);
		$('.search_loading').addClass('isloading');
	}
	brands = [];
	list.forEach((b) => {
		if (b.Brand.toLowerCase().indexOf(str.toLowerCase()) > -1) {
			brands.push(b);
		}
	})
	ajaxPost('search', {search:str, psize:10, pnum:s_page}, null, function(res) {
		$('.search_loading').removeClass('isloading');
		if (s_page == 1 && res.data.WheelStyles.length == 0 && brands.length==0) {
			$('.search_cont').html('<div class="empty tcenter" style="width: 100%;">There are not search results.</div>');
		} else {
			if (s_page == 1 && brands.length > 0) {
				strHtml = '';
				brands.forEach((b) => {
					strHtml += `<a class='sitem sitem_brand' href="products/`+b.Brand+`"><img src="`+b.Logo+`"></a>`;
				})
				$('.brands').html(`<div class='search_title'>Brands</div>`+strHtml);
			}
			if (s_page == 1 && res.data.WheelStyles.length > 0) {
				$('.search_cont .styles').html(`<div class='search_title'>Wheels</div>`);
			}
			res.data.WheelStyles.forEach((a) => {
				for (i=0; i<a.Diameters.length; i++) {
					a.Diameters[i] = a.Diameters[i]+'"';
				}
				strHtml = `
					<a class='sitem' href="products/`+a.Brand+`--`+a.Id+`">
						<img src="`+(res.data.ImgUrlBase+a.Img0001)+`" />
						<div>
							<div class='font_bold'>`+a.Brand+`</div>
							<div class='fsize14'>`+a.Model+`</div>
							<div class='font_bold clrgray'>`+a.Diameters.join('| ')+`</div>
						</div>
					</a>
				`;
				$('.search_cont .styles').append(strHtml);
			})
			if (res.data.MoreItems) {
				$('.search_cont').append(`<div class='flex flex_jcenter more'>Show more..</div>`);
			}
			$('.search_result .more').unbind('click');
			$('.search_result .more').click(function() {
				$(this).remove();
				s_page ++;
				search(str);
			})
		}
	}, false);
}
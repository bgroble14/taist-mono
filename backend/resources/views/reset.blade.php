<?php 
    include $_SERVER['DOCUMENT_ROOT'].'/include/config.php';
    $is_signup = isset($_GET['signup']) && $_GET['signup']==1 ? true : false;
?>
<!DOCTYPE html>

<html lang="en"><head>

    <meta charset="utf-8">
    
    <link rel="icon" type="image/png" href="/assets/images/favicon.png" />    
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="robots" content="NOINDEX, NOFOLLOW">
    <meta name="description" content="">
    <meta name="author" content="">
    <title><?php echo $title;?></title>

    <link rel="stylesheet" href="{{ url('assets/libs/css/bootstrap.css') }}">
    <link rel="stylesheet" href="{{ url('assets/libs/css/bootstrap-switch.css') }}">
    <link rel="stylesheet" href="{{ url('assets/libs/css/font-awesome.css') }}">
    <link rel="stylesheet" href="{{ url('assets/libs/css/bootstrap-table.css') }}">

    <link rel="stylesheet" href="{{ url('assets/css/main.css?r='.time()) }}">
    <link rel="stylesheet" href="{{ url('assets/css/index.css?r='.time()) }}">
    <link rel="stylesheet" href="{{ url('assets/login/index.css?r='.time()) }}">

    <script type="text/javascript">
        var serverURL = "<?php echo $serverURL; ?>";
    </script>
    <script src="{{ url('assets/js/config.js?r='.time()) }}"></script>
    <script src="{{ url('assets/libs/js/jwt-decode.js') }}"></script>
    <script src="https://accounts.google.com/gsi/client" async defer></script>

</head>

<body>

    <div class="div_loading">
        <img src="/assets/images/load_image.webp" />
    </div>

    <div class="wrapper">        
        <div class="flex flex_acenter flex_jspace top_nav login_top_nav">
            <a href="../"><img class="logo" src="/assets/images/logo-2.png"></a>
            <div class="flex flex_acenter">
                <span style="margin-right: 16px;">Already have an account?</span>
                <a class="bt bt_white" href="../login">SIGN IN</a>
            </div>
        </div>

        <form class="slogin div_login" method="POST" action="/resetpassword" id="reset_form">
            {{ csrf_field() }}
            <?php if (isset($_GET['success'])) { ?>
                <div class="font_medium fsize22 mb24 tcenter">Your password has been reset now.</div>
                <div class="flex flex_jcenter">
                    <a class="bt" href="/login">SIGN IN</a>
                </div>
            <?php } else { ?>
                <div class="font_medium fsize22 mb24">RESET PASSWORD</div>
                <div class="d_input mb16">
                    <input class="form-control f_input" type="password" id="password" name="password" placeholder="New password" />
                </div>
                <div class="d_input mb16">
                    <input class="form-control f_input" type="password" id="password_confirmation" name="password_confirmation" placeholder="Confirm password" />
                </div>
                <input type="hidden" id="code" name="code" value="<?php echo $_GET['code'];?>" />
                <div class="error mb4">
                    @if($errors->any())
                        {{ implode('', $errors->all(':message')) }}
                    @enderror
                </div>
                <div class="bt" id="bt_reset">RESET PASSWORD</div>
            <?php } ?>
        </form>
    </div>

</body>

    <script src="{{ url('assets/libs/js/jquery-3.1.1.js') }}"></script>
    <script src="{{ url('assets/libs/js/bootstrap.js') }}"></script>
    <script src="{{ url('assets/libs/js/bootstrap-switch.js') }}"></script>
    <script src="{{ url('assets/libs/js/bootstrap-table.js') }}"></script>
    <script src="{{ url('assets/js/main.js?r='.time()) }}"></script>
    <script src="{{ url('assets/js/index.js?r='.time()) }}"></script>
    
</html>
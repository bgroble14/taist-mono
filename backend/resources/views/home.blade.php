<?php 
    include $_SERVER['DOCUMENT_ROOT'].'/include/config.php';
?>
<!DOCTYPE html>

<html lang="en"><head>

    <meta charset="utf-8">
    
    <link rel="icon" type="image/png" href="/assets/images/favicon.png?r=1" />    
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

    <script type="text/javascript">
        var serverURL = "<?php echo $serverURL; ?>";
    </script>
    <script src="{{ url('assets/js/config.js?r='.time()) }}"></script>
    <script src="{{ url('assets/libs/js/jwt-decode.js') }}"></script>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
</head>

<body class="body_home">


    <div class="wrapper pt40">
        <div class="flex flex_acenter flex_jcenter pt40">
            <img class="logo" src="/assets/images/logo.png?r=1">
        </div>
        <div class="flex flex_acenter flex_jcenter pt20 fsize32 font_bold">
            Taist
        </div>
    </div>

</body>

    <script src="{{ url('assets/libs/js/jquery-3.1.1.js') }}"></script>
    <script src="{{ url('assets/libs/js/bootstrap.js') }}"></script>
    <script src="{{ url('assets/libs/js/bootstrap-switch.js') }}"></script>
    <script src="{{ url('assets/libs/js/bootstrap-table.js') }}"></script>

    <script type="text/javascript">
    </script>
    <script src="{{ url('assets/js/main.js?r='.time()) }}"></script>
    
    <script type="text/javascript">
        $(function() {
            var apiKey = "ra_jk6YK9QmAVqTazHIrF1vi3qnbtagCIJoZAzCR51lCpYY9nkTN6aPVeX15J49k";
            var apiToken = "ebzTiWzNGp3BYI956H4h6yLssvvC0n659ef304f210ekgrdRgWHzhSdQvJTi3G9T0PpENaZBW";
            apiToken = "WpUIn8sr963UEciAWixjtPN5dxOwOu659fc6456a5e0HDczrrucV8vLQyMQszHQQYnEk0kBcv";
            
        })
    </script>
</html>

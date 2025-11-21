<!doctype html>
<html>
    <head>
        @include('includes.head')
    </head>
<body>
    <?php 
        echo "<script>var token='".$user->api_token."';</script>";
    ?>
    @include('includes.admin_header')

    @yield('content')

    @include('includes.admin_footer')
    @yield('page-scripts')
</body>
</html>
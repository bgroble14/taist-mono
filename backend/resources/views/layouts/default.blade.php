<!doctype html>
<html>
    <head>
        @include('includes.head')
    </head>
<body>
    @include('includes.header')

    @yield('content')

    @include('includes.footer')
    @yield('page-scripts')
</body>
</html>
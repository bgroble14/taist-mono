<!doctype html>
<html>
    <head>
        @include('includes.head')
        <title>@yield('title', config('admin.title', 'Taist - Admin Panel'))</title>
        @stack('styles')
    </head>
<body>
    @unless(Request::is('admin/login') || Request::is('admin'))
        @if(isset($user) && $user)
            <script>
                var token = '{{ $user->api_token ?? "" }}';
            </script>
        @endif
        @include('includes.admin_header')
    @endunless

    @yield('content')

    @include('includes.admin_footer')
    @stack('scripts')
    @yield('page-scripts')
</body>
</html>

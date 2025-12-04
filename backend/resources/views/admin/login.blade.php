@extends('layouts.admin')

@section('title', config('admin.title') . ' - Login')

@section('content')
    @php
        $is_signup = isset($_GET['signup']) && $_GET['signup']==1 ? true : false;
    @endphp

    <link rel="stylesheet" href="{{ url('assets/login/index.css?r='.time()) }}">

    <div class="div_loading">
        <img src="/assets/images/load_image.webp" />
    </div>

    <div class="wrapper">   
        <form class="slogin div_login" method="POST" action="/admin/login" id="login_form">
            {{ csrf_field() }}
            <div class="flex flex_jcenter mb10">
                <img class="logo" src="/assets/images/logo-2.png" style="height:120px">
            </div>
            <div class="pt40"></div>
            <div class="font_medium fsize18 clrgray mb24 tcenter">ADMIN SIGN IN</div>
            <div class="d_input">
                <input class="form-control f_input" id="email" name="email" placeholder="Enter email" required />
            </div>
            <div class="d_input mb16">
                <input class="form-control f_input" id="password" name="password" type="password" placeholder="Enter password" required />
            </div>
            <div class="error">
                @if($errors->any())
                    {{ implode('', $errors->all(':message')) }}
                @enderror
            </div>
            <button type="submit" class="bt" id="bt_login" style="width:100%">SIGN IN</button>
        </form>
    </div>
@endsection

@section('page-scripts')
    <script src="{{ url('assets/libs/js/jquery-3.1.1.js') }}"></script>
    <script src="{{ url('assets/libs/js/bootstrap.js') }}"></script>
    <script src="{{ url('assets/libs/js/bootstrap-switch.js') }}"></script>
    <script src="{{ url('assets/libs/js/bootstrap-table.js') }}"></script>
    <script src="{{ url('assets/libs/js/jwt-decode.js') }}"></script>
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    <script src="{{ url('assets/js/main.js?r='.time()) }}"></script>
    <script>
        $(function() {

        })
    </script>
@endsection
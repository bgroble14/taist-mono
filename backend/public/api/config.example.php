<?php 
	ini_set('display_errors', 1);
	error_reporting(E_ALL);

	$database = array(
		'host' => 'localhost',
		'db' => 'db_taist',
		'user' => 'root',
		'pass' => 'YOUR_DATABASE_PASSWORD'
	);

	function connect($database) {
	    try {
	        $connect = new PDO('mysql:host='. $database['host'] .';dbname='. $database['db'], $database['user'], $database['pass'], array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES  \'utf8mb4\''));
	        return $connect;
	        
	    } catch (PDOException $e) {
	        return false;
	    }
	}
    function filterData(&$str){ 
        $str = preg_replace("/\t/", "\\t", $str); 
        $str = preg_replace("/\r?\n/", "\\n", $str); 
        if(strstr($str, '"')) $str = '"' . str_replace('"', '""', $str) . '"'; 
    }

	function secondsToDhms($seconds) {
	    $seconds = ($seconds);
	    $d = floor($seconds / (3600*24));
	    $h = floor($seconds % (3600*24) / 3600);
	    $m = floor($seconds % 3600 / 60);
	    $s = floor($seconds % 60);

	    $dDisplay = $d > 0 ? $d . ($d == 1 ? "d " : "d ") : "";
	    $hDisplay = $h > 0 ? $h . ($h == 1 ? "h " : "h ") : "";
	    $mDisplay = $m > 0 ? $m . ($m == 1 ? "m " : "m ") : "";
	    $sDisplay = $s > 0 ? $s . ($s == 1 ? "s" : "s") : "";
	    return $dDisplay . $hDisplay . $mDisplay;
	}
?>

<?php

define('DB_USER', 'user');
define('DB_PASSWORD', 'password');
define('DB_NAME', 'db');

if(class_exists('DB')){
	DB::$user = DB_USER;
	DB::$password = DB_PASSWORD;
	DB::$dbName = DB_NAME;

	DB::$encoding = 'utf8';
}

?>

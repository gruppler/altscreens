<?php

function dateFromJS($date){
  return $date ? date('Y-m-d H:i:s', ($date/1000)) : null;
}

function dateToJS($date){
  return $date ? strtotime($date)*1000 : null;
}

function durationFromJS($start, $end){
  $seconds = round(($end - $start)/1000);
  $hours = floor($seconds/3600);
  $seconds -= $hours*3600;
  $minutes = floor($seconds/60);
  $seconds -= $minutes*60;
  return str_pad($hours, 2, '0', STR_PAD_LEFT).':'.str_pad($minutes, 2, '0', STR_PAD_LEFT).":".str_pad($seconds, 2, '0', STR_PAD_LEFT);
}

function get_id($obj){
  return $obj->id;
}

function id_to_model($id){
  return array('id' => intval($id));
}

function redirect($url, $permanent = false){
  if(strpos($url, 'http') !== 0){
    $url = URL_ROOT.'/'.ltrim($url, '/');
  }
  header('Location: '.$url, true, $permanent ? 301 : 302);
  exit();
}

function is_xhr(){
  return !empty($_SERVER['HTTP_X_REQUESTED_WITH'])
    && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest';
}

function reply($response){
  header('content-type: application/json; charset=utf-8');
  print json_encode($response);
}

function send_file($filename, $file){
  header('Pragma: public');
  header('Expires: 0');
  header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
  header('Cache-Control: private', false);
  header('Content-Type: application/octet-stream');
  header('Content-Disposition: attachment; filename="'.$filename.'";' );
  header('Content-Transfer-Encoding: binary');
  print($file);
  exit;
}

if(!function_exists('str_putcsv')){
  function str_putcsv($input, $delimiter = ',', $enclosure = '"'){
    $fp = fopen('php://temp', 'r+');
    fputcsv($fp, $input, $delimiter, $enclosure);
    rewind($fp);
    $data = fread($fp, 1048576);
    fclose($fp);
    return rtrim($data, "\n");
  }
}


/****************** Math Utilities ******************/

function avg($values){
  $count = count($values);
  return $count ? array_sum(array_map('floatval', $values))/$count : 0;
}

function ci($values){
  $n = count($values);
  $std = stddev($values);
  $stderr = $std/sqrt($n);
  return $stderr*ttable($n - 1);
}
function ci_range($values, $avg){
  $ci = ci($values);
  return $ci >= 0.25 ? array(
    max(0, round($avg - $ci, 0)),
    min(100, round($avg + $ci, 0))
  ) : array(round($avg, 0));
}

// Function to calculate square of value - mean
function sd_square($x, $mean){
  return pow($x - $mean, 2);
}

// Function to calculate standard deviation (uses sd_square)
// input: an array over which you want to calculate the stddev

function stddev($array){
  // square root of sum of squares divided by N-1
  $n = count($array) - 1;
  return sqrt(array_sum(array_map(
    'sd_square',
    $array,
    array_fill(0, count($array), (array_sum($array) / count($array)))
  ))/($n ? $n : 1));
}

function ttable($df){
  $dfs = array(
    '1' => 12.71,
    '2' => 4.303,
    '3' => 3.182,
    '4' => 2.776,
    '5' => 2.571,
    '6' => 2.447,
    '7' => 2.365,
    '8' => 2.306,
    '9' => 2.262,
    '10' => 2.228,
    '11' => 2.201,
    '12' => 2.179,
    '13' => 2.160,
    '14' => 2.145,
    '15' => 2.131,
    '16' => 2.120,
    '17' => 2.110,
    '18' => 2.101,
    '19' => 2.093,
    '20' => 2.086,
    '21' => 2.080,
    '22' => 2.074,
    '23' => 2.069,
    '24' => 2.064,
    '25' => 2.060,
    '26' => 2.056,
    '27' => 2.052,
    '28' => 2.048,
    '29' => 2.045,
    '30' => 2.042,
    '40' => 2.021,
    '50' => 2.009,
    '60' => 2.000,
    '80' => 1.990,
    '100' => 1.984,
    '1000' => 1.962,
    '100000000' => 1.960,
  );
  //maps the degrees of freedom, note for large values this needs to be rounded to the nearest key
  if(array_key_exists($df,$dfs)){
    return $dfs[$df];
  }else{
    $keys = array_keys($dfs);
    foreach($keys as $i=>$n){
      if($n > $df){
        if($i == 0){
          return $dfs[$n];
        }else{
          $m = $keys[$i - 1];
          if($n - $df >= $df - $m){
            return $dfs[$m];
          }else{
            return $dfs[$n];
          }
        }
      }
    }
    return 129;
  }
}

if(!function_exists('array_column')){
  function array_column(array $input, $column_key, $index_key = null){
    $result = array();
    foreach($input as $k => $v){
      $result[$index_key ? $v[$index_key] : $k] = $v[$column_key];
    }
    return $result;
  }
}

?>

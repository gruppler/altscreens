<?php

ini_set('date.timezone', 'America/New_York');

session_start();

require_once 'lib/meekrodb.class.php';
require_once 'lib/db.auth.php';
require_once 'lib/globals.php';

$config = file_get_contents('js/config.js');
$config = json_decode(substr($config, strpos($config, '{')));
$errors = array('', 'MISS', 'AA');

function concept_name($id){
  global $config;
  $id -= 1;
  return chr(65+$id).' ('.$config->concepts[$id]->size.', '.$config->concepts[$id]->spacing.')';
}

function format_data($row){
  global $config, $errors;
  if(isset($row)){
    if(isset($row['size'])) $row['size'] = $config->concepts[$row['concept']-1]->size;
    if(isset($row['spacing'])) $row['spacing'] = $config->concepts[$row['concept']-1]->spacing;
    if(isset($row['concept'])) $row['concept'] = concept_name($row['concept']);
    if(isset($row['error'])) $row['error'] = $errors[$row['error']];
    if(isset($row['touch'])) $row['touch'] += 1;
    if(isset($row['target'])) $row['target'] = str_replace(array('-', '4', '3', '2', '1', '0'), array('x', '5', '4', '3', '2', '1'), $row['target']);
  }
  return $row;
}

if(isset($_REQUEST['type'])){
  switch($_REQUEST['type']){
    case 'touches':
      $filename = 'touches.csv';
      $csv = array_values(array_map('format_data',
        DB::query('SELECT p.id, p.name, t.concept, 0 size, 0 spacing, t.trial, t.touch, t.x, t.y, t.time, t.error, t.timeouts, t.target FROM touches t LEFT JOIN participants p ON t.participant = p.id')
      ));
      array_unshift($csv, array(
        'Participant ID', 'Name', 'Concept', 'Size (mm)', 'Spacing (mm)', 'Trial #', 'Touch #', 'X (mm)', 'Y (mm)', 'Time (ms)', 'Error', 'Timeouts', 'Target Button'
      ));
      break;
    case 'trials':
      $filename = 'trials.csv';
      $csv = array_values(array_map('format_data',
        DB::query('SELECT p.id, p.name, t.concept, t.trial, MAX(t.time) time, SUM(IF(t.error=1,1,0)) misses, SUM(IF(t.error=2,1,0)) aas, SUM(IF(t.error=0,0,0)) errors, SUM(t.timeouts) timeouts FROM touches t LEFT JOIN participants p ON t.participant = p.id GROUP BY p.id, t.concept, t.trial')
        ));
      array_unshift($csv, array(
        'Participant ID', 'Name', 'Concept', 'Trial #', 'Time (ms)', 'Misses', 'AAS', 'Errors', 'Timeouts'
      ));
      break;
    case 'concepts':
      $filename = 'concepts.csv';
      $csv = array_values(array_map('format_data',
        DB::query('SELECT p.id, p.name, p.concept, MAX(IF(r.question=1,r.rating,0)) Q1, MAX(IF(r.question=2,r.rating,0)) Q2, MAX(IF(r.question=3,r.rating,0)) Q3, AVG(p.time) avgtime, STD(p.time) stdtime, AVG(p.errors) avgerrors, STD(p.errors) stderrors, AVG(p.misses) avgmisses, STD(p.misses) stdmisses, AVG(p.aas) avgaas, STD(p.aas) stdaas, AVG(p.timeouts) avgtimeouts, STD(p.timeouts) stdtimeouts FROM (SELECT p.id, p.name, t.concept, t.trial, MAX(t.time) time, SUM(IF(t.error=1,1,0)) misses, SUM(IF(t.error=2,1,0)) aas, SUM(IF(t.error=0,0,1)) errors, SUM(t.timeouts) timeouts FROM touches t LEFT JOIN participants p ON t.participant = p.id GROUP BY p.id, t.concept, t.trial) p LEFT JOIN ratings r ON r.participant = p.id AND r.concept = p.concept GROUP BY p.id, p.concept ORDER BY r.participant ASC, r.concept ASC, r.question ASC')
        ));
      array_unshift($csv, array(
        'Participant ID', 'Name', 'Concept', 'Rating 1', 'Rating 2', 'Rating 3', 'Average Time (ms)', 'STD Time (ms)', 'Average Errors', 'STD Errors', 'Average Misses', 'STD Misses', 'Average AAs', 'STD AAs', 'Average Timeouts', 'STD Timeouts'
      ));
      break;
    default:
      exit;
  }
  send_file($filename, implode("\n", array_map('str_putcsv', $csv)));
}

?>
<html>
  <head>
    <meta charset="utf8"/>

    <title>Buttons</title>

    <link rel="stylesheet" href="css/topcoat/css/topcoat-mobile-dark.min.css">
    <link rel="stylesheet" href="css/style.css">
  </head>
  <body class="center box-center">
    <div>
      <div><a href="?type=touches" class="topcoat-button--cta">Download Touches</a></div>
      <div class="pad"><a href="?type=trials" class="topcoat-button--cta">Download Trials</a></div>
      <div><a href="?type=concepts" class="topcoat-button--cta">Download Concepts</a></div>
    </div>
  </body>
</html>
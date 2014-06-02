<?php

ini_set('date.timezone', 'America/New_York');

session_start();

require_once 'lib/meekrodb.class.php';
require_once 'lib/flight/Flight.php';
require_once 'lib/db.auth.php';
require_once 'lib/globals.php';

Flight::route('OPTIONS *', function(){
  header('Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: origin, content-type, accept');
});


/****************** Participants ******************/

// Create/Update
Flight::route('POST|PUT /api/participants(/@id)', function($id = false){
  $id = saveParticipant($id, (array) json_decode(Flight::request()->body));
  reply(getParticipant($id));
});

// Destroy
// Flight::route('DELETE /api/participants/@id', function($id){
//   DB::delete('participants', 'id=%i', $id);
//   DB::query('ALTER TABLE participants AUTO_INCREMENT = 1');
//   reply(array('id'=>$id));
// });

function saveParticipant($id = false, $request){
  $participant = array(
    'finished' => $request[0],
    'name' => $request[1],
    'age' => $request[2],
    'gender' => $request[3],
    'year' => $request[4],
    'make' => $request[5],
    'model' => $request[6],
    'word1' => $request[7],
    'word2' => $request[8],
    'word3' => $request[9]
  );

  if($id){
    $participant['id'] = $id;
    DB::insertUpdate('participants', $participant, 'id=%i', $id);
  }else{
    DB::insert('participants', $participant);
    $id = DB::insertId();
  }

  if(isset($request[10])){
    DB::delete('definitions', 'participant=%i AND `not`=0', $id);
    $participant['synonyms'] = array();
    foreach($request[10] as $metric => $words){
      foreach($words as $word){
        $participant['synonyms'][] = array(
          'participant' => $id,
          'metric' => $metric,
          'not' => 0,
          'word' => $word
        );
      }
    }
    array_map('saveDefinition', $participant['synonyms']);
  }

  if(isset($request[11])){
    DB::delete('definitions', 'participant=%i AND `not`=1', $id);
    $participant['antonyms'] = array();
    foreach($request[11] as $metric => $words){
      foreach($words as $word){
        $participant['antonyms'][] = array(
          'participant' => $id,
          'metric' => $metric,
          'not' => 1,
          'word' => $word
        );
      }
    }
    array_map('saveDefinition', $participant['antonyms']);
  }

  if(isset($request[12])){
    DB::delete('ratings', 'participant=%i', $id);
    $participant['ratings'] = array();
    foreach($request[12] as $i => $rating){
      $participant['ratings'][$i] = array(
        'participant' => $id,
        'concept' => $rating[0],
        'metric' => $rating[1],
        'rating' => $rating[2]
      );
    }
    array_map('saveRating', $participant['ratings']);
  }

  if(isset($request[13])){
    DB::delete('weights', 'participant=%i', $id);
    $participant['weights'] = array();
    foreach($request[13] as $i => $weight){
      $participant['weights'][$i] = array(
        'participant' => $id,
        'metric' => $weight[0],
        'weight' => $weight[1]
      );
    }
    array_map('saveWeight', $participant['weights']);
  }

  return $id;
}

function getParticipant($id){
  return formatParticipant(DB::queryFirstRow('SELECT * FROM participants WHERE id=%i', $id));
}

function formatParticipant($participant){
  if(isset($participant)){
    $participant['id'] = (int) $participant['id'];
    $participant['finished'] = (int) $participant['finished'];
    $participant['age'] = (int) $participant['age'];
    $participant['gender'] = (int) $participant['gender'];
    $participant['year'] = (int) $participant['year'];
    $participant['make'] = (int) $participant['make'];
    $participant['model'] = (int) $participant['model'];
    $participant['synonyms'] = listSynonyms($participant['id'], true);
    $participant['antonyms'] = listAntonyms($participant['id'], true);
    $participant['ratings'] = listRatings($participant['id'], true);
    $participant['weights'] = listWeights($participant['id'], true);
    return $participant;
    // return array(
    //   0 => $participant['finished'],
    //   1 => $participant['name'],
    //   2 => $participant['age'],
    //   3 => $participant['gender'],
    //   4 => $participant['year'],
    //   5 => $participant['make'],
    //   6 => $participant['model'],
    //   7 => $participant['word1'],
    //   8 => $participant['word2'],
    //   9 => $participant['word3'],
    //   10 => $participant['synonyms'],
    //   11 => $participant['antonyms'],
    //   12 => $participant['ratings'],
    //   13 => $participant['weights'],
    //   14 => $participant['id']
    // );
  }
}


/****************** Ratings ******************/

function saveRating($request){
  DB::insertUpdate('ratings', array(
    'participant' => $request['participant'],
    'concept' => $request['concept'],
    'metric' => $request['metric'],
    'rating' => $request['rating']
  ));
}

function listRatings($participant){
  return array_map('formatRatingCompressed', DB::query('SELECT * FROM ratings WHERE participant=%i', $participant));
}

function getRating($participant, $concept, $metric){
  return formatRating(DB::queryFirstRow('SELECT * FROM ratings WHERE participant=%i AND concept=%i AND metric=%i', $participant, $concept, $metric));
}

function formatRating($rating){
  if(isset($rating)){
    $rating['participant'] = (int) $rating['participant'];
    $rating['concept'] = (int) $rating['concept'];
    $rating['metric'] = (int) $rating['metric'];
    $rating['rating'] = (int) $rating['rating'];
    return $rating;
  }
}

function formatRatingCompressed($rating){
  if(isset($rating)){
    $rating = formatRating($rating);
    unset($rating['participant']);
    return array_values($rating);
  }
}


/****************** Weights ******************/

function saveWeight($request){
  DB::insertUpdate('weights', array(
    'participant' => $request['participant'],
    'metric' => $request['metric'],
    'weight' => $request['weight']
  ));
}

function listWeights($participant){
  return array_map('formatWeightCompressed', DB::query('SELECT * FROM weights WHERE participant=%i', $participant));
}

function getWeight($participant, $metric){
  return formatWeight(DB::queryFirstRow('SELECT * FROM weights WHERE participant=%i AND metric=%i', $participant, $metric));
}

function formatWeight($weight){
  if(isset($weight)){
    $weight['participant'] = (int) $weight['participant'];
    $weight['metric'] = (int) $weight['metric'];
    $weight['weight'] = (int) $weight['weight'];
    return $weight;
  }
}

function formatWeightCompressed($weight){
  if(isset($weight)){
    $weight = formatWeight($weight);
    unset($weight['participant']);
    return array_values($weight);
  }
}


/****************** Definitions ******************/

// Create/Update
Flight::route('PUT /api/definitions/', function(){
  saveDefinition((array) json_decode(Flight::request()->body));
  reply(getDefinition($request->participant, $request->metric));
});

function saveDefinition($request){
  DB::insert('definitions', array(
    'participant' => $request['participant'],
    'metric' => $request['metric'],
    'not' => $request['not'],
    'word' => $request['word']
  ));
}

function listSynonyms($participant){
  return array_map('formatDefinitionCompressed', DB::query('SELECT metric, GROUP_CONCAT(word) words FROM definitions WHERE `not`=0 AND participant=%i GROUP BY metric', $participant));
}

function listAntonyms($participant){
  return array_map('formatDefinitionCompressed', DB::query('SELECT metric, GROUP_CONCAT(word) words FROM definitions WHERE `not`=1 AND participant=%i GROUP BY metric', $participant));
}

function getDefinition($participant, $metric){
  return formatDefinition(DB::queryFirstRow('SELECT * FROM definitions WHERE participant=%i AND metric=%i', $participant, $metric));
}

function formatDefinitionCompressed($definition){
  if(isset($definition)){
    return array($definition['metric'] => array_map('intval', explode(',', $definition['words'])));
  }
}


/****************** Initialization ******************/

Flight::start();

?>

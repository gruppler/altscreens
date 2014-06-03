"use strict"

// Models

var Participant = Backbone.Model.extend({
  defaults: {
    finished: 0,
    name: '',
    age: 0,
    gender: 0,
    year: 0,
    make: 0,
    model: 0,
    word1: '',
    word2: '',
    word3: '',
    synonyms: {},
    antonyms: {},
    ratings: [],
    weights: []
  },

  toJSON: function(){
    return [
      this.get('finished'),
      this.get('name'),
      this.get('age'),
      this.get('gender'),
      this.get('year'),
      this.get('make'),
      this.get('model'),
      this.get('word1'),
      this.get('word2'),
      this.get('word3'),
      this.get('synonyms'),
      this.get('antonyms'),
      this.get('ratings'),
      this.get('weights'),
      this.id
    ];
  },

  parse: function(data){
    if(_.isArray(data)){
      return {
        finished: data[0],
        name: data[1],
        age: data[2],
        gender: data[3],
        year: data[4],
        make: data[5],
        model: data[6],
        word1: data[7],
        word2: data[8],
        word3: data[9],
        synonyms: data[10],
        antonyms: data[11],
        ratings: data[12],
        weights: data[13],
        id: data[14]
      };
    }else{
      return data;
    }
  },

  initialize: function(){
    this.concepts = {};
    this.weights = {};
  }
});

var ParticipantList = Backbone.Collection.extend({
  model: Participant,
  url: 'api/participants/',
  storeName: 'participants/',

  initialize: function(){
    this.on('sync error destroy', function(){
      app.view.update_sync_button();
    });
  }
});


// Views

var NewParticipantView = Backbone.View.extend({
  initialize: function(){
    _.bindAll(this, 'render', 'list_models', 'submit');
    this.$el.$name = this.$('[name=name]');
    this.$el.$year = this.$('[name=year]');
    this.$el.$make = this.$('[name=make]');
    this.$el.$model = this.$('[name=model]');
    this.$el.$form = this.$('form');

    var i = config.vehicles.years[1] - config.vehicles.years[0] + 1;
    for(var year = config.vehicles.years[1]; year >= config.vehicles.years[0]; year--){
      this.$el.$year.append('<option value="'+(i--)+'">'+year+'</option>');
    }

    i = 1;
    for(var make in config.vehicles.makes){
      this.$el.$make.append('<option value="'+(i++)+'">'+make+'</option>');
    }
  },

  render: function(){
    this.$el.$form[0].reset();
    this.$el.$name;
    this.$el.$model.html('<option value="">Model</option>');
  },

  events: {
    'show': 'render',
    'change [name=make]': 'list_models',
    'submit form': 'submit'
  },

  list_models: function(){
    var that = this;

    this.$el.$model.html('<option value="">Model</option>');
    _.map(config.vehicles.makes[_.keys(config.vehicles.makes)[1*this.$el.$make.val()-1]], function(model, i){
      that.$el.$model.append('<option value="'+(i+1)+'">'+model+'</option>');
    });
  },

  submit: function(event){
    var participant;

    this.$el.$name.blur();

    participant = new Participant({
      name: this.$el.$name.val(),
      age: 1*this.$('[name=age]').val(),
      gender: 1*this.$('[name=gender]:checked').val(),
      year: 1*this.$('[name=year]').val(),
      make: 1*this.$('[name=make]').val(),
      model: 1*this.$('[name=model]').val()
    });

    this.model.add(participant);
    participant.save();
    app.router.go('homework/'+participant.id);

    event.preventDefault();
  }
});


var HomeworkView = Backbone.View.extend({
  initialize: function(){
    _.bindAll(this, 'render', 'submit');
    this.$el.$word1 = this.$('[name=word1]');
    this.$el.$word2 = this.$('[name=word2]');
    this.$el.$word3 = this.$('[name=word3]');
    this.$el.$form = this.$('form');
  },

  render: function(){
    this.$el.$word1.val(app.participant.get('word1'));
    this.$el.$word2.val(app.participant.get('word2'));
    this.$el.$word3.val(app.participant.get('word3'));
  },

  events: {
    'show': 'render',
    'submit form': 'submit'
  },

  submit: function(event){
    this.$('input').blur();

    app.participant.save({
      word1: this.$el.$word1.val(),
      word2: this.$el.$word2.val(),
      word3: this.$el.$word3.val()
    });
    app.router.go('definition/'+app.pid+'/0');

    event.preventDefault();
  }
});


var DefinitionView = Backbone.View.extend({
  initialize: function(){
    _.bindAll(this, 'render', 'show_synonyms', 'show_antonyms', 'select_button', 'clear_button', 'submit');

    this.$el.$term = this.$('.term');
    this.$el.$synonym_instructions = this.$('.instructions.synonym');
    this.$el.$antonym_instructions = this.$('.instructions.antonym');
    this.$el.$words = this.$('.words');
    this.$el.$prev = this.$('.prev');
    this.$el.$next = this.$('.next');
  },

  render: function(){
    var that = this;

    this.$el.$term.text(app.metric.name);

    this.synonyms = app.participant.get('synonyms');
    this.synonyms = app.metric.id in this.synonyms ? this.synonyms[app.metric.id].concat() : [];
    this.antonyms = app.participant.get('antonyms');
    this.antonyms = app.metric.id in this.antonyms ? this.antonyms[app.metric.id].concat() : [];

    this.$el.$words.empty().append(_.map(app.metric.words.shuffle(app.pid), function(word, i){
      return '<button class="topcoat-button" value="'+i+'"><span class="topcoat-icon icomatic"></span> '+word+'</button>';
    }));

    _.each(this.synonyms, function(val){
      that.select_button(that.$el.$words.find('[value='+val+']'), true);
    });
    _.each(this.antonyms, function(val){
      that.select_button(that.$el.$words.find('[value='+val+']'), false);
    });

    this.show_synonyms();
  },

  show_synonyms: function(){
    this.is_synonym = true;
    this.$el.$synonym_instructions.show();
    this.$el.$antonym_instructions.hide();
    this.$el.$prev.prop('disabled', true);
    this.$el.$next.prop('disabled', this.get_synonyms().length != 3);
    this.$('.synonym').prop('disabled', false);
    this.$('.antonym').prop('disabled', true);
  },

  show_antonyms: function(){
    this.is_synonym = false;
    this.$el.$synonym_instructions.hide();
    this.$el.$antonym_instructions.show();
    this.$el.$prev.prop('disabled', false);
    this.$el.$next.prop('disabled', this.get_antonyms().length != 3);
    this.$('.synonym').prop('disabled', true);
    this.$('.antonym').prop('disabled', false);
  },

  get_synonyms: function(){
    return this.$el.$words.find('.synonym');
  },

  get_antonyms: function(){
    return this.$el.$words.find('.antonym');
  },

  events: {
    'show': 'render',
    'tap .words button': 'select',
    'tap .prev': 'show_synonyms',
    'tap .next': 'submit'
  },

  select_button: function($button, is_synonym){
    $button
      .addClass('selected '+(is_synonym ? 'synonym' : 'antonym'))
      .find('.icomatic').text(is_synonym ? 'check' : 'cancel');
  },

  clear_button: function($button){
    $button.removeClass('selected synonym antonym').find('.icomatic').text('');
  },

  select: function(event){
    var $button = $(event.currentTarget);

    if(this.is_synonym){
      if($button.hasClass('selected')){
        this.clear_button($button);
      }else if(this.get_synonyms().length < 3){
        this.select_button($button, this.is_synonym);
      }
      this.$el.$next.prop('disabled', this.get_synonyms().length != 3);
    }else{
      if($button.hasClass('selected')){
        this.clear_button($button);
      }else if(this.get_antonyms().length < 3){
        this.select_button($button, this.is_synonym);
      }
      this.$el.$next.prop('disabled', this.get_antonyms().length != 3);
    }

    event.preventDefault();
  },

  submit: function(event){
    if(this.is_synonym){
      this.show_antonyms();
      this.synonyms = _.map(this.get_synonyms(), function(button){
        return button.value*1;
      });
    }else{
      this.antonyms = _.map(this.get_antonyms(), function(button){
        return button.value*1;
      });
      app.participant.get('synonyms')[app.metric.id] = this.synonyms;
      app.participant.get('antonyms')[app.metric.id] = this.antonyms;
      app.participant.save({});

      if(app.mid < config.metrics.length - 1){
        app.router.go('definition/'+app.pid+'/'+(app.mid+1));
      }else{
        app.router.go('concept/'+app.pid+'/1/intro');
      }
    }

    event.preventDefault();
  }
});


var ReviewView = Backbone.View.extend({
  initialize: function(){
    var that = this;

    _.bindAll(this, 'render');

    this.$el.$name = this.$('.name');
    this.$el.$car = this.$('.car');
    this.$el.$words = this.$('.words');

    this.$('thead tr').append(
      '<th></th>',
      _.map(config.concepts, function(concept){
        return '<th>'+concept.name+'</th>';
      }),
      '<th>Weights</th>',
      '<th>Is</th>',
      '<th>Is Not</th>'
    );

    this.$('tbody').append(
      _.map(config.metrics, function(metric){
        return $('<tr><th>'+metric.name+'</th></tr>').append(
          _.map(config.concepts, function(concept){
            return '<td class="'+concept.id+'-'+metric.id+'"></td>';
          }),
          '<td class="0-'+metric.id+'"></td>',
          '<td class="is-'+metric.id+'"></td>',
          '<td class="isnot-'+metric.id+'"></td>'
        );
      }),
      $('<tr><th>Rank</th></tr>').append(
        _.map(config.concepts, function(concept){
          return '<td class="'+concept.id+'-0"></td>';
        }),
        '<td>(100%)</td>',
        '<td></td>',
        '<td></td>'
      )
    );
  },

  render: function(){
    var that = this
      , ratings = app.participant.get('ratings')
      , weights = app.participant.get('weights')
      , synonyms = app.participant.get('synonyms')
      , antonyms = app.participant.get('antonyms')
      , make = _.keys(config.vehicles.makes)[app.participant.get('make') - 1];

    this.$el.$name.text(app.participant.get('name'));

    this.$el.$car.text(
      (app.participant.get('year') + config.vehicles.years[0] - 2)
      +' '+make
      +' '+config.vehicles.makes[make][app.participant.get('model') - 1]
    );

    this.$el.$words.text(
      app.participant.get('word1')
      +', '+app.participant.get('word2')
      +', '+app.participant.get('word3')
    );

    _.each(config.metrics, function(metric){
      that.$('.is-'+metric.id).html(
        _.map(synonyms[metric.id], function(word){
          return metric.words[word];
        }).join('<br/>')
      );
      that.$('.isnot-'+metric.id).html(
        _.map(antonyms[metric.id], function(word){
          return metric.words[word];
        }).join('<br/>')
      );
    });

    _.each(ratings, function(rating){
      that.$('.'+rating[0]+'-'+rating[1]).text(rating[2]);
    });
    _.each(weights, function(weight){
      that.$('.0-'+weight[0]).text(Math.round(weight[1])+'%');
    });
  },

  events: {
    'show': 'render'
  }
});

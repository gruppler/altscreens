"use strict"

var app = {};

$(function(){

  app.broadcast = _.extend({}, Backbone.Events);

  app.router = new (Backbone.Router.extend({
    routes: {
      'setup': 'setup',
      '': 'welcome',
      'intro': 'intro',
      'new': 'new_participant',
      'homework/:pid': 'homework',
      'definition/:pid/:mid': 'definition',
      'concept/:pid/:cid/intro': 'concept_intro',
      'concept/:pid/:cid': 'concept',
      'ratings/:pid/:cid/:mid': 'ratings',
      'ranking/:pid': 'ranking',
      'weights/:pid': 'weights',
      'finished/:pid': 'finished',
      'review/:pid': 'review'
    },

    initialize: function(){
      _.bindAll(this, 'go', 'setup', 'welcome', 'new_participant', 'intro', 'homework', 'definition', 'concept_intro', 'concept', 'ratings', 'ranking', 'weights', 'finished', 'review');
    },

    go: function(url){
      if(url){
        this.navigate(url, {trigger: true});
      }else{
        this.navigate('', {replace: true});
        this.navigate(Backbone.history.fragment, {replace: true, trigger: true});
      }
    },

    home: function(){
      this.go('/');
    },

    get_concept: function(pid, cid){
      return ('day' in config && 'car' in config) ?
        config.concepts.balance(config.day*5 + config.car)[cid - 1]
        : config.concepts[cid - 1];
    },

    setup: function(){
      app.view.show_page(app.view.setup.$el);
    },

    welcome: function(){
      var participant = app.participants.findWhere({finished: 0})
        , ratings, mid;

      if(participant){
        ratings = participant.get('ratings');
        if(!participant.get('word1') || !participant.get('word2') || !participant.get('word3')){
          // Homework
          this.go('homework/'+participant.id);
        }else if(participant.get('synonyms').length < config.metrics.length || participant.get('antonyms').length < config.metrics.length){
          // Definitions
          this.go('definition/'+participant.id+'/'+participant.get('definitions').length);
        }else if(config.concepts.length * config.metrics.length > ratings.length){
          // Ratings
          mid = ratings.length % config.metrics.length;
          this.go(
            (mid ? 'ratings/' : 'concept/')
            +participant.id+'/'
            +(Math.floor(ratings.length / config.metrics.length) + 1)+'/'
            +(mid ? mid : 'intro')
          );
        }else if(config.concepts.length * (config.metrics.length + 1) > ratings.length){
          // Ranking
          this.go('ranking/'+participant.id);
        }else{
          // Weights
          this.go('weights/'+participant.id);
        }
      }else{
        app.participant = null;
        app.pid = null;
        app.cid = null;
        app.concept = null;
        app.mid = null;
        app.metric = null;

        app.view.show_page(app.view.welcome.$el);
      }
    },

    intro: function(){
      app.view.show_page(app.view.intro.$el);
    },

    new_participant: function(){
      app.pid = null;
      app.participant = null;
      app.cid = null;
      app.concept = null;
      app.mid = null;
      app.metric = null;

      app.view.show_page(app.view.new_participant.$el);
    },

    homework: function(pid){
      app.pid = pid;
      app.participant = app.participants.get(pid);
      if(!app.participant){
        return this.home();
      }

      app.cid = null;
      app.concept = null;
      app.mid = null;
      app.metric = null;

      app.view.show_page(app.view.homework.$el);
    },

    definition: function(pid, mid){
      mid = 1*mid;
      app.pid = pid;
      app.participant = app.participants.get(pid);
      if(!app.participant){
        return this.home();
      }

      app.cid = null;
      app.concept = null;
      app.mid = mid;
      app.metric = config.metrics[mid];

      app.view.show_page(app.view.definition.$el);
    },

    concept_intro: function(pid, cid){
      cid = 1*cid;
      app.pid = pid;
      app.participant = app.participants.get(pid);
      if(!app.participant){
        return this.home();
      }

      app.cid = cid;
      app.concept = this.get_concept(app.pid, app.cid);
      app.mid = null;
      app.metric = null;

      app.view.show_page(app.view.concept_intro.$el);
    },

    concept: function(pid, cid){
      cid = 1*cid;
      app.pid = pid;
      app.participant = app.participants.get(pid);
      if(!app.participant){
        return this.home();
      }

      app.cid = cid;
      app.concept = this.get_concept(app.pid, app.cid);
      app.mid = null;
      app.metric = null;

      app.view.show_page(app.view.concept.$el);
    },

    ratings: function(pid, cid, mid){
      cid = 1*cid;
      mid = 1*mid;
      app.pid = pid;
      app.participant = app.participants.get(pid);
      if(!app.participant){
        return this.home();
      }

      app.cid = cid;
      app.concept = this.get_concept(app.pid, app.cid);
      app.mid = mid;
      app.metric = config.metrics[mid];

      app.view.show_page(app.view.ratings.$el);
    },

    ranking: function(pid){
      app.pid = pid;
      app.participant = app.participants.get(pid);
      if(!app.participant){
        return this.home();
      }

      app.cid = null;
      app.concept = null;
      app.mid = null;
      app.metric = null;

      app.view.show_page(app.view.ranking.$el);
    },

    weights: function(pid){
      app.pid = pid;
      app.participant = app.participants.get(pid);
      if(!app.participant){
        return this.home();
      }

      app.cid = null;
      app.concept = null;
      app.mid = null;
      app.metric = null;

      app.view.show_page(app.view.weights.$el);
    },

    finished: function(pid){
      app.pid = pid;
      app.participant = app.participants.get(pid);
      if(!app.participant){
        return this.home();
      }

      app.cid = null;
      app.concept = null;
      app.mid = null;
      app.metric = null;

      app.view.show_page(app.view.finished.$el);
    },

    review: function(pid){
      app.pid = pid;
      app.participant = app.participants.get(pid);
      if(!app.participant){
        return this.home();
      }

      app.cid = null;
      app.concept = null;
      app.mid = null;
      app.metric = null;

      app.view.show_page(app.view.review.$el);
    }
  }));

  app.view = new (Backbone.View.extend({
    el: 'body',

    initialize: function(){
      _.bindAll(this, 'show_page', 'update_sync_button', 'pause_session', 'fullscreen');

      // Disable overscroll
      $(document).on('touchmove', function(event){
        event.preventDefault();
      });
      $('body').on('touchmove', '.scrollable, input[type=range]', stopPropagation);

      // Label concepts
      for(var i = 0; i < config.concepts.length; i++){
        config.concepts[i].id = i + 1;
      }

      // Label metrics
      for(var i = 0; i < config.metrics.length; i++){
        config.metrics[i].id = i + 1;
      }

      // Create global participant lists
      app.participants = new ParticipantList();
      app.participants.local = true;
      app.finished = new ParticipantList();
      app.finished.storeName = 'finished/';


      // Create 'page' views
      this.welcome = new (Backbone.View.extend({
        el: '#page-welcome'
      }))();

      this.intro = new (Backbone.View.extend({
        el: '#page-intro'
      }))();

      this.new_participant = new NewParticipantView({
        el: '#page-new-participant',
        model: app.participants
      });

      this.homework = new HomeworkView({
        el: '#page-homework'
      });

      this.definition = new DefinitionView({
        el: '#page-definition'
      });

      this.concept_intro = new (Backbone.View.extend({
        el: '#page-concept-intro',
        render: function(){
          this.$('.concept-label').text(app.concept.name);
          if(app.cid == 1){
            this.$('.intro').show();
            this.$('.finished').hide();
          }else{
            this.$('.intro').hide();
            this.$('.finished').show();
          }
        },
        events: {
          'show': 'render',
          'tap .next': 'next'
        },
        next: function(){
          app.router.go('ratings/'+app.pid+'/'+app.cid+'/0');
        }
      }))();

      this.concept = new ConceptView({
        el: '#page-concept'
      });

      this.ratings = new RatingView({
        el: '#page-ratings'
      });

      this.ranking = new RankingView({
        el: '#page-ranking'
      });

      this.weights = new WeightView({
        el: '#page-weights'
      });

      this.finished = new (Backbone.View.extend({
        el: '#page-finished',
        render: function(){
          this.$('.name').text(app.participant.get('name'));
        },
        events: {
          'show': 'render',
          'hold': 'next'
        },
        next: function(){
          app.router.go('review/'+app.pid);
        }
      }))();

      this.review = new ReviewView({
        el: '#page-review'
      });

      this.pause = new (Backbone.View.extend({
        el: '#page-pause',
        render: function(){
          app.view.update_sync_button();
        },
        events: {
          'show': 'render',
          'tap .abort': 'abort',
          'tap .resume': 'resume'
        },
        abort: function(event){
          if(!app.participant || confirm('Are you sure you want to cancel this session and delete its data?')){
            this.$el.hide();
            if(app.participant){
              app.participant.destroy();
            }
            app.router.home();
          }
          event.preventDefault();
          stopPropagation(event);
        },
        resume: function(event){
          this.$el.hide();
          app.broadcast.trigger('resume');
          event.preventDefault();
          stopPropagation(event);
        }
      }));

      this.setup = new (Backbone.View.extend({
        el: '#page-setup',
        render: function(){
          if(!('day' in config && 'car' in config)){
            this.$('.resume').prop('disabled', true);
          }else{
            this.$('[name=day][value='+(config.day+1)+']');
            this.$('[name=car][value='+(config.car+1)+']');
            this.$('.resume').prop('disabled', false);
          }
        },
        events: {
          'show': 'render',
          'touchstart label': 'select',
          'change label': 'select',
          'tap .resume': 'resume'
        },
        select: function(event){
          var $target = $(event.currentTarget)
            , $input = $target.is('input') ? $target : $target.find('input').prop('checked', true);

          config[$input.attr('name')] = $input.val() - 1;
          this.$('.resume').prop('disabled', !('day' in config && 'car' in config));
          event.preventDefault();
          stopPropagation(event);
        },
        resume: function(event){
          this.$el.hide();
          app.router.go(app.prevURL);
        }
      }))();

      this.imgzoom = new (Backbone.View.extend({
        el: '#page-imgzoom',
        show: function(thumb){
          this.$el.empty().append(thumb.full);
        },
        events: {
          'tap': 'hide'
        },
        hide: function(event){
          this.$el.hide();
          event.preventDefault();
          stopPropagation(event);
        }
      }))();


      // Misc script initialization

      this.$el.hammer({
        tap_max_distance: 25,
        tap_max_touchtime: Infinity
      });

      this.$('form').h5Validate();

      this.$el.$sync = this.$el.find('.sync');
    },

    show_page: function($page){
      app.broadcast.trigger('navigate');
      $page.show().trigger('show');
      if(!$page.hasClass('modal')){
        $page.siblings('.page').hide();
      }
      $(window).scrollTop(0);
    },

    update_sync_button: function(){
      this.$el.$sync.prop('disabled', false);
      if(app.participants.where({finished: 1}).length || app.finished.dirtyModels().length){
        this.$el.$sync.addClass('dirty').find('.icomatic').text('cloud');
      }else{
        this.$el.$sync.removeClass('dirty').find('.icomatic').text('refresh');
      }
    },

    events: {
      'tap .sync': 'sync',
      'hold .pause': 'pause_session',
      'tap img.thumb': 'fullscreen'
    },

    sync: function(event){
      var unsynced = app.participants.where({finished: 1});

      if(!unsynced.length){
        return;
      }

      this.$el.$sync.addClass('dirty').prop('disabled', true);

      _.each(unsynced, function(participant){
        var clone = participant.clone();
        app.finished.add(clone);
        clone.save({}, {
          remote: false,
          success: function(){
            participant.destroy();
          },
          error: function(){
            clone.destroy();
          }
        });
      });

      app.finished.syncDirtyAndDestroyed();

      event.preventDefault();
    },

    pause_session: function(event){
      event.preventDefault();
      stopPropagation(event);
      this.show_page(this.pause.$el);
      app.broadcast.trigger('pause');
    },

    fullscreen: function(event){
      this.imgzoom.show(event.currentTarget);
      this.show_page(this.imgzoom.$el);
      event.preventDefault();
    }
  }))();

  app.finished.fetch({remote: false});
  app.participants.fetch({
    success: function(){
      for(var i = 0; i < config.concepts.length; i++){
        // Preload screens
        config.concepts[i].img = [];
        for(var j = 0; j < config.concepts[i].screens.length; j++){
          config.concepts[i].img[j] = new Image();
          config.concepts[i].img[j].className = 'thumb';
          config.concepts[i].img[j].full = $('<div class="fullscreen-image">').css('background-image', 'url('+config.concepts[i].screens[j]+')');
          if(!i && !j){
            config.concepts[i].img[j].onload = function(){
              config.screens = {
                width: this.width,
                height: this.height,
                aspect: this.width / this.height
              };

              Backbone.history.start();
              app.view.$el.addClass('initialized');

              if(Backbone.history.fragment == 'setup'){
                app.router.home();
              }
              app.prevURL = Backbone.history.fragment;
              app.router.go('setup');
            };
          }
          config.concepts[i].img[j].src = config.concepts[i].screens[j];
        }
      }
    }
  });
});

function stopPropagation(event){
  if(typeof event.stopPropagation != 'undefined'){
    event.stopPropagation();
  }else{
    event.cancelBubble = true;
  }
}

function px2mm(px){
  return px/config.ppmm;
}

function mm2px(mm){
  return mm*config.ppmm;
}

// (Pseudo-)randomize an array using a seed
Array.prototype.shuffle = function(seed){
  if(!_.isUndefined(seed)){
    Math.seedrandom(seed);
  }
  return _.shuffle(this);
}

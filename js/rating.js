"use strict"

var RatingView = Backbone.View.extend({
  initialize: function(){
    _.bindAll(this, 'render', 'select_rating', 'submit', 'prev', 'next');

    this.$el.$screens = this.$('.screens');
    this.$el.$label = this.$('.concept-label');
    this.$el.$metric = this.$('.metric');
    this.$el.$rating = this.$('.ratings');
    this.$el.$back = this.$('.prev');
    this.$el.$next = this.$('.next');
  },

  render: function(){
    this.model = new Rating({
      participant: app.participant,
      concept: new Concept({
        participant: app.participant,
        config: app.concept
      }),
      metric: app.metric
    });

    var metric = this.model.metric
      , options = metric.options
      , score = this.model.rating;

    this.$el.$screens.empty().append(this.model.concept.config.img);

    this.$el.$label.text(this.model.metric.name);
    this.$el.$metric.text(this.model.metric.text);

    this.$el.$rating.html(
      '<div class="rating scale-'+options.length+'" id="'+metric.id+'">'
        +_.map(options, function(label, value){
          value += 1;
          var checked = isFinite(score) && score == value ? ' checked' : ''

          return '<div class="option'+checked+'" data-value="'+value+'">'
            +'<div class="selector">'+value+'</div>'
            +(label || '')
          +'</div>';
        }).join('')
      +'</div>'
    );

    this.$el.$back.prop('disabled', !app.mid);
    this.$el.$next.prop('disabled', !isFinite(score));
    this.score = score;
  },

  events: {
    'show': 'render',
    'touch .option': 'select_rating',
    'tap .prev': 'prev',
    'tap .next': 'submit'
  },

  select_rating: function(event){
    var $option = $(event.currentTarget);

    $option.addClass('checked').siblings('.option').removeClass('checked');
    this.$el.$next.prop('disabled', false);
    this.score = 1*$option.data('value');

    event.preventDefault();
  },

  submit: function(event){
    if(isFinite(this.score)){
      this.model.set_rating(this.score);
      this.next();
    }

    event.preventDefault();
  },

  prev: function(){
    if(app.mid > 0){
      app.router.go('ratings/'+app.pid+'/'+app.cid+'/'+(app.mid - 1));
    }
  },

  next: function(){
    if(app.mid < config.metrics.length - 1){
      app.router.go('ratings/'+app.pid+'/'+app.cid+'/'+(app.mid + 1));
    }else if(app.cid < config.concepts.length){
      app.router.go('concept/'+app.pid+'/'+(app.cid + 1)+'/intro');
    }else{
      app.router.go('ranking/'+app.pid);
    }
  }
});


var RankingView = Backbone.View.extend({
  initialize: function(){
    _.bindAll(this, 'render', 'submit', 'dragstart', 'drag', 'dragend');

    this.$el.$concepts = this.$('.concepts');
    this.$el.$ranking = this.$('.ranking');
    this.$el.$next = this.$('.next');
  },

  render: function(){
    var that = this
      , rankings = _.where(app.participant.get('ratings'), {1: 0})
      , container_width = this.$el.$concepts.width()
      , width = Math.round(app.view.$el.width()*0.44)
      , height = Math.round((width)/(3*config.screens.aspect))
      , left = ((container_width - width)/2);

    this.$el.$concepts.empty();
    this.$el.$ranking.empty();

    this.model = _.map(config.concepts.balance((config.day||0)*5 + (config.car||0)), function(concept, cid){
      var rating = new Rating({
        participant: app.participant,
        concept: new Concept({
          participant: app.participant,
          config: concept,
          cid: cid + 1
        }),
        metric: {id: 0}
      });

      that.$el.$concepts.append($('<div class="draggable">').append(concept.img).data('rating', rating));

      that.$el.$ranking.append($('<div class="droppable">'+(cid+1)+'</div>').css({
        width: width + 2,
        height: height,
        lineHeight: height+'px'
      }).data('rank', cid + 1));

      return rating;
    });

    this.$el.$concepts.css({
      height: this.$el.$ranking.height()
    });

    this.$('.draggable').each(function(i){
      var $this = $(this);

      $this.css({
        width: width,
        height: height,
        top: i*(height+14)+'px',
        left: left+'px',
        position: 'absolute'
      }).data({
        'initial_pos': $this.position()
      });
    });

    this.$el.$next.prop('disabled', rankings < config.concepts.length);
  },

  events: {
    'show': 'render',
    'tap .next': 'submit',
    'dragstart .draggable': 'dragstart',
    'drag': 'drag',
    'dragend .draggable': 'dragend'
  },

  submit: function(event){
    event.preventDefault();

    this.$el.$ranking.children('.filled').each(function(i){
      $(this).data('concept').data('rating').set_rating(i + 1);
    });

    app.router.go('weights/'+app.pid);
  },

  dragstart: function(event){
    if(!('gesture' in event)){
      return;
    }

    this.$el.$dragging = $(event.currentTarget);

    if(this.$el.$dragging.data('rank')){
      this.$el.$dragging.data('rank').removeClass('filled');
    }

    this.$el.$dragging.addClass('dragging');
    this.$el.$dragging.data('drag_pos', {
      x: event.gesture.touches[0].clientX,
      y: event.gesture.touches[0].clientY
    });
  },

  drag: function(event){
    if(!('gesture' in event) || !this.$el.$dragging){
      return;
    }

    var $drag = this.$el.$dragging
      , x = event.gesture.touches[0].clientX - $drag.data('drag_pos').x
      , y = event.gesture.touches[0].clientY - $drag.data('drag_pos').y
      , offset, centerX, centerY;

    $drag.css('-webkit-transform', 'translate('+x+'px,'+y+'px)');


    offset = $drag.offset();
    centerX = offset.left + $drag.width()/2;
    centerY = offset.top + $drag.height()/2;

    this.$el.$ranking.children().each(function(){
      var $this = $(this)
        , offset = $this.offset();

      if(
        centerX >= offset.left && centerX <= offset.left + $this.width()
        && centerY >= offset.top && centerY <= offset.top + $this.height()
      ){
        $this.addClass('hovered');
      }else{
        $this.removeClass('hovered');
      }
    });
  },

  dragend: function(event){
    if(!this.$el.$dragging){
      return;
    }

    var $rank = this.$el.$ranking.children('.hovered').removeClass('hovered').addClass('filled')
      , offset = $rank.offset()
      , $prev_rank = this.$el.$dragging.data('rank') || null
      , $prev_concept;

    this.$el.$dragging.css('-webkit-transform', '');
    if($rank.length){
      $prev_concept = $rank.data('concept');
      if($prev_concept){

        if($prev_rank){
          $prev_concept
            .offset(this.$el.$dragging.data('last_pos'))
            .data({
              'last_pos': this.$el.$dragging.data('last_pos'),
              'rank': $prev_rank
            });
          $prev_rank.addClass('filled').data('concept', $prev_concept);
        }else{
          $prev_concept
            .css({
              top: $prev_concept.data('initial_pos').top,
              left: $prev_concept.data('initial_pos').left
            }).data({
              'last_pos': $prev_concept.data('initial_pos'),
              'rank': null
            });
        }
      }else if($prev_rank){
        $prev_rank.data('concept', null);
      }

      $rank.data('concept', this.$el.$dragging);
      this.$el.$dragging.data('rank', $rank);

      this.$el.$dragging.offset({
        top: Math.round(offset.top) + 2,
        left: Math.round(offset.left) + 2
      });
    // }else if($prev_rank){
    //   $prev_rank.addClass('filled');
    }else{
      if($prev_rank){
        $prev_rank.removeClass('filled').data('concept', null);
      }
      this.$el.$dragging.css({
        top: this.$el.$dragging.data('initial_pos').top,
        left: this.$el.$dragging.data('initial_pos').left
      }).data('rank', null);
    }

    this.$el.$dragging.data('last_pos', this.$el.$dragging.offset());
    this.$el.$dragging.removeClass('dragging');
    this.$el.$dragging = null;

    this.$el.$next.prop('disabled', !!this.$el.$ranking.children(':not(.filled)').length);
  }
});


var Rating = function(args){
  if(args.metric.id in args.concept.ratings){
    return args.concept.ratings[args.metric.id];
  }else{
    args.concept.ratings[args.metric.id] = this;
  }

  this.participant = args.participant;
  this.concept = args.concept,
  this.metric = args.metric;
  this.output = _.findWhere(this.participant.get('ratings'), {
    0: this.concept.id,
    1: this.metric.id
  });

  if(isFinite(args.rating)){
    this.set_rating(args.rating);
  }else{
    this.rating = this.output ? this.output[2] : undefined;
  }

  this.set_rating = function(rating){
    this.rating = 1*rating;
    if(!isFinite(this.rating)){
      this.rating = undefined;
    }

    if(!this.output){
      this.output = [
        this.concept.id,
        this.metric.id,
        this.rating
      ];
      if(isFinite(this.rating)){
        this.participant.get('ratings').push(this.output);
      }
    }else{
      this.output[2] = this.rating;
    }

    this.participant.save();
  };

  _.bindAll(this, 'set_rating');
  return this;
};

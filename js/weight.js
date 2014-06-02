"use strict"

var WeightView = Backbone.View.extend({
  initialize: function(){
    var that = this;

    _.bindAll(this, 'render', 'submit', 'check_collisions');

    this.$el.$weights = this.$('.weights');
    this.$el.$next = this.$('.next');

    _.each(config.metrics, function(metric){
      that.$el.$weights.append('<p><label class="instructions">'+metric.name+'</label><input type="range" name="'+metric.id+'" min="0" max="100" class="topcoat-range weight" value="0"></p>');
    });
  },

  render: function(){
    var that = this;

    this.model = _.map(config.metrics, function(metric){
      var weight = new Weight({
        participant: app.participant,
        metric: metric
      });

      that.$('[name='+metric.id+']').val('weight' in weight ? weight.weight || 0 : 0);

      return weight;
    });

    this.check_collisions();
  },

  events: {
    'show': 'render',
    'tap .next': 'submit',
    'change input[type=range]': 'check_collisions'
  },

  submit: function(event){
    var that = this;

    _.each(this.model, function(weight){
      weight.set_weight(that.$('[name='+weight.metric.id+']').val());
    });

    app.participant.save({finished: 1});
    app.router.go('finished/'+app.pid);

    event.preventDefault();
  },

  check_collisions: function(){
    var $ranges = this.$('input[type=range]').removeClass('error')
      , collision = false;

    for(var i = 0; i < $ranges.length; i++){
      for(var j = i + 1; j < $ranges.length; j++){
        if($ranges[i].value == $ranges[j].value){
          $($ranges[i]).add($ranges[j]).addClass('error');
          collision = true;
        }
      }
    }

    this.$el.$next.prop('disabled', collision);
  }
});


var Weight = function(args){
  if(args.metric.id in args.participant.weights){
    return args.participant.weights[args.metric.id];
  }else{
    args.participant.weights[args.metric.id] = this;
  }

  this.participant = args.participant;
  this.metric = args.metric;
  this.output = _.findWhere(this.participant.get('weights'), {0: this.metric.id});

  if(isFinite(args.weight)){
    this.set_weight(args.weight);
  }else{
    this.weight = this.output ? this.output[1] : undefined;
  }

  this.set_weight = function(weight){
    this.weight = 1*weight;
    if(!isFinite(this.weight)){
      this.weight = undefined;
    }

    if(!this.output){
      this.output = [
        this.metric.id,
        this.weight
      ];
      if(isFinite(this.weight)){
        this.participant.get('weights').push(this.output);
      }
    }else{
      this.output[1] = this.weight;
    }

    this.participant.save({}, {remote: false});
  };

  _.bindAll(this, 'set_weight');
  return this;
};

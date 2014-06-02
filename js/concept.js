"use strict"

var Concept = function(args){
  if(args.config.id in args.participant.concepts){
    return args.participant.concepts[args.config.id];
  }else{
    args.participant.concepts[args.config.id] = this;
  }

  this.participant = args.participant;
  this.config = args.config;
  this.id = this.config.id;
  this.ratings = {};

  return this;
};

var ConceptView = Backbone.View.extend({
  initialize: function(){
    _.bindAll(this, 'render', 'show_screen', 'prev', 'next');

    this.$el.$img = this.$('.img');
  },

  render: function(){
    this.show_screen(0);
  },

  show_screen: function(sid){
    if(isFinite(sid) && sid >= 0 && app.concept.screens.length > sid){
      this.sid = sid;
      this.$el.$img.empty().append(app.concept.img[sid].full);
    }else{
      this.$el.$img.empty();
    }
  },

  events: {
    'show': 'render',
    'tap .prev': 'prev',
    'tap .next': 'next'
  },

  prev: function(event){
    if(this.sid){
      this.show_screen(this.sid - 1);
    }else{
      app.router.go('concept/'+app.pid+'/'+app.cid+'/intro');
    }
  },

  next: function(event){
    if(this.sid < app.concept.screens.length - 1){
      this.show_screen(this.sid + 1);
    }else{
      app.router.go('ratings/'+app.pid+'/'+app.cid+'/0');
    }
  }
});

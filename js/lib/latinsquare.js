Array.prototype.balance = function(r){
  var that = this;

  if(Math.floor(r/that.length)%2){
    that = that.concat().reverse();
  }

  return this.map(function(a, i){
    return that[(i%2 ? r+0.5+i/2 : r+that.length-i/2) % that.length];
  });
};

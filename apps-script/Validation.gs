var ValidationService = {
  tour: function(tour) {
    if (!tour || typeof tour !== 'object') throw new Error('Invalid tour data.');
    if (!String(tour.school || '').trim()) throw new Error('School is required.');
    if (!String(tour.destination || '').trim()) throw new Error('Destination is required.');

    var g = tour.group || {};
    var s = g.students || {}, t = g.teachers || {}, e = g.escorts || {};
    var boys = Number(s.boys || 0), girls = Number(s.girls || 0);
    if ([boys,girls,Number(t.male||0),Number(t.female||0),Number(e.male||0),Number(e.female||0)].some(function(x){return x<0 || !isFinite(x);})){
      throw new Error('Group counts must be non-negative numbers.');
    }
    return true;
  }
};

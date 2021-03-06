// gists.js
var Gists = require('../models/gists');
var sw = require("swagger-node-express");
var param = sw.params;
var url = require("url");
var swe = sw.errors;
var _ = require('underscore');


/*
 *  Util Functions
 */

function writeResponse (res, response, start) {
  sw.setHeaders(res);
  res.header('Duration-ms', new Date() - start);
  if (response.neo4j) {
    res.header('Neo4j', JSON.stringify(response.neo4j));
  }
  res.send(JSON.stringify(response.results));
}

function parseUrl(req, key) {
  return url.parse(req.url,true).query[key];
}

function parseBool (req, key) {
  return 'true' == url.parse(req.url,true).query[key];
}


/*
 * API Specs and Functions
 */

exports.list = {
  'spec': {
    "description" : "List all gists",
    "path" : "/gists",
    "notes" : "Returns all gists",
    "summary" : "Find all gists",
    "method": "GET",
    "params" : [],
    "responseClass" : "List[Gist]",
    "errorResponses" : [swe.notFound('gists')],
    "nickname" : "getGists"
  },
  'action': function (req, res) {
    var options = {
      neo4j: parseBool(req, 'neo4j'),
      search_query: req.query.query
    };
    var start = new Date();
    Gists.getByStatusAndFeatured({status: req.query.status || 'live', featured: parseBool(req, 'featured')}, options, function (err, response) {
      if (err || !response.results) return(res.status(500).json({ error: 'Error getting gists' }));

      writeResponse(res, response, start);
    });
  }
};

exports.gistCount = {
  'spec': {
    "description" : "Gist count",
    "path" : "/gists/count",
    "notes" : "Gist count",
    "summary" : "Gist count",
    "method": "GET",
    "params" : [],
    "responseClass" : "Count",
    "errorResponses" : [swe.notFound('gists')],
    "nickname" : "gistCount"
  },
  'action': function (req, res) {
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();
    Gists.getAllCount(null, options, function (err, response) {
      // if (err || !response.results) throw swe.notFound('gists');
      writeResponse(res, response, start);
    });
  }
};

exports.findById = {
  'spec': {
    "description" : "find a gist",
    "path" : "/gists/{id}",
    "notes" : "Returns a gist based on ID",
    "summary" : "Find gist by ID",
    "method": "GET",
    "params" : [
      param.path("id", "ID of gist that needs to be fetched", "integer")
    ],
    "responseClass" : "Gist",
    "errorResponses" : [swe.invalid('id'), swe.notFound('gist')],
    "nickname" : "getGistById"
  },
  'action': function (req,res) {
    var id = decodeURIComponent(req.params.id);

    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();

    if (!id) throw swe.invalid('id');

    var params = {
      id: id
    };

    var callback = function (err, response) {
      if (err) throw swe.notFound('gist');
      writeResponse(res, response.results ? response : '', start);
    };


    Gists.getById(params, options, callback);

  }
};

exports.findByTitle = {
  'spec': {
    "description" : "Find a gist",
    "path" : "/gists/title/{title}",
    "notes" : "Returns a gist based on title",
    "summary" : "Find gist by title",
    "method": "GET",
    "params" : [
      param.path("title", "Title of gist that needs to be fetched", "string")
    ],
    "responseClass" : "Gist",
    "errorResponses" : [swe.invalid('title'), swe.notFound('gist')],
    "nickname" : "getGistByTitle"
  },
  'action': function (req,res) {
    var title = req.params.title;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();

    if (!title) throw swe.invalid('title');

    var params = {
      title: title
    };

    Gists.getByTitle(params, options, function (err, response) {
        if (err) throw swe.notFound('gists');
        writeResponse(res, response, start);
      });

  }
};

exports.findByGenre = {
  'spec': {
    "description" : "Find a gist",
    "path" : "/gists/genre/{name}",
    "notes" : "Returns gists based on genre",
    "summary" : "Find gist by genre",
    "method": "GET",
    "params" : [
      param.path("name", "The name of the genre", "string")
    ],
    "responseClass" : "Gist",
    "errorResponses" : [swe.invalid('name'), swe.notFound('gist')],
    "nickname" : "getGistsByGenre"
  },
  'action': function (req,res) {
    var name = req.params.name;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };
    var start = new Date();

    if (!name) throw swe.invalid('name');

    var params = {
      name: name
    };

    Gists.getByGenre(params, options, function (err, response) {
        if (err) throw swe.notFound('gists');
        writeResponse(res, response, start);
      });

  }
};

exports.findGistsByDateRange = {
  'spec': {
    "description" : "Find gists",
    "path" : "/gists/daterange/{start}/{end}",
    "notes" : "Returns gists between a year range",
    "summary" : "Find gist by year range",
    "method": "GET",
    "params" : [
      param.path("start", "Year that the gist was released on or after", "integer"),
      param.path("end", "Year that the gist was released before", "integer")
    ],
    "responseClass" : "Gist",
    "errorResponses" : [swe.invalid('start'), swe.invalid('end'), swe.notFound('gist')],
    "nickname" : "getGistsByDateRange"
  },
  'action': function (req,res) {
    var start = req.params.start;
    var end = req.params.end;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };

    if (!start) throw swe.invalid('start');
    if (!end) throw swe.invalid('end');

    var params = {
      start: start,
      end: end
    };

    var callback = function (err, response) {
      if (err) throw swe.notFound('gist');
      writeResponse(res, response, new Date());
    };


    Gists.getByDateRange(params, options, callback);

  }
};

exports.findGistsByActor = {
  'spec': {
    "description" : "Find gists",
    "path" : "/gists/actor/{name}",
    "notes" : "Returns gists that a person acted in",
    "summary" : "Find gists by actor",
    "method": "GET",
    "params" : [
      param.path("name", "Name of the actor who acted in gists", "string")
    ],
    "responseClass" : "Gist",
    "errorResponses" : [swe.invalid('name'), swe.notFound('gist')],
    "nickname" : "getGistsByActor"
  },
  'action': function (req,res) {
    var name = req.params.name;
    var options = {
      neo4j: parseBool(req, 'neo4j')
    };

    if (!name) throw swe.invalid('name');

    var params = {
      name: name
    };

    var callback = function (err, response) {
      if (err) throw swe.notFound('gist');
      writeResponse(res, response, new Date());
    };


    Gists.getByActor(params, options, callback);

  }
};

var VALID_CREATE_KEYS = ['url', 'title', 'categories', 'summary', 'poster_image',
                         'submitter_name', 'submitter_twitter', 'submitter_postal_address', 'submitter_email', 'submitter_tshirt_size', 'submitter_tshirt_size_other'];

basicAuth = require('../../basic_auth');

exports.createGist = {
  spec: {
    description: "Create a gist submission",
    path: "/gists",
    method: "POST",
    notes: "Create a gist submission",
    summary: "Create a gist submission",
    responseClass: "Gist",
    errorResponses : [swe.invalid('body')],
    nickname: "createGist"
  },
  action: function (req, res) {
    // Validate so that nobody is submitting sneaky data

    if (_(_(req.body).keys()).difference(VALID_CREATE_KEYS).length) {
      throw swe.invalid('body')
    }

    Gists.create(_(req.body).extend({status: 'candidate'}), {}, function (err, query, data) {
      if (err) {
        throw err;
      } else {
        writeResponse(res, query, data);
      }
    });
  }
}

exports.updateGist = {
  spec: {
    description: "Update a gist submission",
    path: "/gists/{id}",
    method: "PUT",
    notes: "Update a gist submission",
    summary: "Update a gist submission",
    responseClass: "Gist",
    errorResponses : [swe.invalid('body')],
    nickname: "updateGist"
  },
  action: [
    basicAuth,
    function (req, res) {
      // Validate so that nobody is submitting sneaky data

      var valid_update_keys = VALID_CREATE_KEYS.concat(['id', 'poster_image', 'rated', 'status', 'featured']);
      var invalid_keys = _(_(req.body).keys()).difference(valid_update_keys);
      
      _(invalid_keys).each(function(invalid_key) {
        delete req.body[invalid_key]
      });

      Gists.update(req.body, {}, function (err, query, data) {
        if (err) {
          throw err;
        } else {
          writeResponse(res, query, data);
        }
      });
    }
  ]
}

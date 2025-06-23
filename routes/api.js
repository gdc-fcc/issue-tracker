'use strict';
const db = require("../databse");

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      db.get_issues(project, res, req);
    })

    .post(function (req, res) {
      db.add_issue(req.params.project, req.body)
        .then(issue => res.json(issue))
        .catch(error => res.json({ error }))
    })

    .put(function (req, res) {
      let project = req.params.project;
      try {
        db.patch_issue(project, res, req.body)
      } catch (e) { }
    })

    .delete(function (req, res) {
      const _id = req.body._id;
      db.delete_issue(req.params.project, _id)
        .then(result => res.json({result, _id}))
        .catch(error => res.json({error, _id}))
    });
};

'use strict';
const db = require("../databse");

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      db.get_issues(req.params.project, req.query)
        .then(issues => res.json(issues));
    })

    .post(function (req, res) {
      db.add_issue(req.params.project, req.body)
        .then(issue => res.json(issue))
        .catch(error => res.json({ error }))
    })

    .put(function (req, res) {
      let project = req.params.project;
      db.patch_issue(project, req.body)
        .then(result => res.json(result))
        .catch(err => res.json(err))
    })

    .delete(function (req, res) {
      const _id = req.body._id;
      db.delete_issue(req.params.project, _id)
        .then(result => res.json({result, _id}))
        .catch(error => res.json({error, _id}))
    });
};

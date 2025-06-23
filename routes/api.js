'use strict';
const db = require("../databse");

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      db.get_issues(project, res, req);
    })

    .post(function (req, res) {
      let project = req.params.project;
      try {
        const issue = db.add_issue(project, req.body);
        res.json(issue);
      } catch (e) {
        res.json({ error: e.message })
      }
    })

    .put(function (req, res) {
      let project = req.params.project;
      try {
        db.patch_issue(project, res, req.body)
      } catch (e) {
        console.log(e)
      }
    })

    .delete(function (req, res) {
      let project = req.params.project;
      db.delete_issue(project, res, req.body._id);
    });

};

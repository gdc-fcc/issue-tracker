const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const generated_ids = [];

suite('Functional Tests', function () {
  suite('Create an issue with...', function () {
    test("every field: POST request to /api/issues/{project}", done => {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/chai')
        .send({
          issue_title: 'title', issue_text: 'text', created_by: 'chai',
          assigned_to: 'dev', status_text: 'status'
        })
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          const issue = JSON.parse(res.text);
          assert.equal(issue.issue_title, 'title');
          generated_ids.push(issue._id);
          done()
        })
    })
    test('only required fields: POST request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/chai')
        .send({ issue_title: 'title', issue_text: 'text', created_by: 'chai' })
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          const issue = JSON.parse(res.text);
          assert.equal(issue.issue_title, 'title');
          generated_ids.push(issue._id);
          done()
        })
    })
    test('missing required fields: POST request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .post('/api/issues/chai')
        .send({ issue_title: 'title', issue_text: 'text' })
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          const issue = JSON.parse(res.text);
          assert.equal(issue.error, 'required field(s) missing');
          done()
        })
    })
  })
  suite('View issues on a project', () => {
    test('GET request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/fcc-project')
        .end(function (err, res) {
          assert.isNull(err);
          assert.equal(res.status, 200);
          const issues = JSON.parse(res.text);
          assert.isAtLeast(issues.length, 1);
          done()
        })
    })
    test('with one filter: GET request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/fcc-project?created_by=fCC')
        .end(function (err, res) {
          assert.isNull(err);
          assert.equal(res.status, 200);
          const issues = JSON.parse(res.text);
          assert.isAtLeast(issues.length, 1);
          done()
        })
    })
    test('with multiple filters: GET request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .get('/api/issues/fcc-project?created_by=fCC&open=true')
        .end(function (err, res) {
          assert.isNull(err);
          assert.equal(res.status, 200);
          const issues = JSON.parse(res.text);
          assert.isAtLeast(issues.length, 1);
          done()
        })
    })
  })
  suite('Update', () => {
    test('one field on an issue: PUT request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/chai')
        .send({ _id: generated_ids[0], issue_title: 'new title' })
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          const issue = JSON.parse(res.text);
          assert.equal(issue.result, 'successfully updated');
          assert.equal(issue._id, generated_ids[0]);
          done()
        })
    })
    test('multiple fields on an issue: PUT request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/chai')
        .send({ _id: generated_ids[0], issue_title: 'new title', open: false })
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          const issue = JSON.parse(res.text);
          assert.equal(issue.result, 'successfully updated');
          assert.equal(issue._id, generated_ids[0]);
          done()
        })
    })
    test('an issue with missing _id: PUT request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/chai')
        .send({ issue_title: 'new title', open: false })
        .end((err, res) => {
          const issue = JSON.parse(res.text);
          assert.equal(issue.error, 'missing _id');
          done()
        })
    })
    test('an issue with no fields to update: PUT request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/chai')
        .send({ _id: generated_ids[0] })
        .end((err, res) => {
          const issue = JSON.parse(res.text);
          assert.equal(issue.error, 'no update field(s) sent');
          done()
        })
    })
    test('with an invalid _id: PUT request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .put('/api/issues/chai')
        .send({ _id: 'invalid', issue_title: 'new title' })
        .end((err, res) => {
          const issue = JSON.parse(res.text);
          assert.equal(issue.error, 'could not update');
          done()
        })
    })
  })
  suite('Delete', () => {
    test('an issue: DELETE request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/chai')
        .send({ _id: generated_ids[0] })
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          const issue = JSON.parse(res.text);
          assert.equal(issue.result, 'successfully deleted');
          done()
        })
    })
    test('an issue with an invalid _id: DELETE request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/chai')
        .send({ _id: 'invalid' })
        .end((err, res) => {
          const issue = JSON.parse(res.text);
          assert.equal(issue.error, 'could not delete');
          done()
        })
    })
    test('an issue with missing _id: DELETE request to /api/issues/{project}', done => {
      chai
        .request(server)
        .keepOpen()
        .delete('/api/issues/chai')
        .send({ })
        .end((err, res) => {
          const issue = JSON.parse(res.text);
          assert.equal(issue.error, 'missing _id');
          done()
        })
    })
  })
});

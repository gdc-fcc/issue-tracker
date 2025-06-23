const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  suite('Create an issue with...', function () {
    test("every field: POST request to /api/issues/{project}")
    test('only required fields: POST request to /api/issues/{project}')
    test('missing required fields: POST request to /api/issues/{project}')
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
    test('one field on an issue: PUT request to /api/issues/{project}')
    test('multiple fields on an issue: PUT request to /api/issues/{project}')
    test('an issue with missing _id: PUT request to /api/issues/{project}')
    test('an issue with no fields to update: PUT request to /api/issues/{project}')
    test('with an invalid _id: PUT request to /api/issues/{project}')
  })
  suite('Delete', () => {
    test('an issue: DELETE request to /api/issues/{project}')
    test('an issue with an invalid _id: DELETE request to /api/issues/{project}')
    test('an issue with missing _id: DELETE request to /api/issues/{project}')
  })
});

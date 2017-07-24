let chai = require('chai');
let chaiHttp = require('chai-http');
let chai_fs = require('chai-fs');
let server = require('../server.ts');
let should = chai.should();
let expect = chai.expect;

chai.use(chaiHttp);
chai.use(chai_fs);

describe('API', () => {
  it('should return the existing apps GET /api', (done) => {
    chai.request(server)
      .get('/api')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        done();
      });
  });
  describe('/add', () => {
    it('should create an app on PUT /api/add', (done) => {
      chai.request(server)
        .put('/api/add?name=test515')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          expect(res.body.status).to.deep.equal(true);
          done();
        });
    });
    it('should return an error on PUT /api/add with the same name', (done) => {
      chai.request(server)
        .put('/api/add?name=test515')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          expect(res.body.status).to.deep.equal(false);
          done();
        });
    });
  });
  describe('/remove', () => {
    it('should return status true & remove the app on PUT /api/remove', (done) => {
      chai.request(server)
        .put('/api/remove?name=test515')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          expect(res.body.status).to.deep.equal(true);
          '../APPS/test515'.should.not.be.a.path;
          done();
        });
    });
  });
});
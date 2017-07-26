let chai = require('chai');
let chaiHttp = require('chai-http');
let chai_fs = require('chai-fs');
let server = require('../server.ts');
let fs = require('fs-extra');
let path = require('path');
let should = chai.should();
let expect = chai.expect;
let App = require('../routes/utility/app.ts').App;

chai.use(chaiHttp);
chai.use(chai_fs);

describe('API /api', () => {
  describe('/', () => {
    it('should return the existing apps GET /api', (done) => {
      chai.request(server)
        .get('/api')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          done();
        });
    });
  });
  describe('/add', () => {
    it('should create an app on PUT /add', (done) => {
      chai.request(server)
        .put('/api/add?name=node_example')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          expect(res.body.status).to.deep.equal(true);
          done();
        });
    });
    it('should return an error on PUT /add with already existing app', (done) => {
      chai.request(server)
        .put('/api/add?name=node_example')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          expect(res.body.status).to.deep.equal(false);
          done();
        });
    });
  });
  describe('/deploy', () => {
    let app = new App('node_example');
    it('should deploy on PUT /deploy', () => {
      fs.copySync(path.resolve('./examples/node_example'), path.resolve('./APPS/node_example/srv'));
      return app.deploy().then((result) => {
        expect(result.status).to.deep.equal(true);
      })
    });
  });
  describe('/start', () => {
    it('should start the app on PUT /start', (done) => {
      chai.request(server)
        .put('/api/start?name=node_example')
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.status).to.deep.equal(true);
          done();
        });
    });
    it('should return error on already started app on PUT /start', (done) => {
      chai.request(server)
        .put('/api/start?name=node_example')
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.status).to.deep.equal(false);
          done();
        });
    });
  });
  describe('/stop', () => {
    it('should stop the app on PUT /stop', (done) => {
      chai.request(server)
        .put('/api/stop?name=node_example')
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.status).to.deep.equal(true);
          done();
        });
    });
    it('should return error on already stopped app on PUT /stop', (done) => {
      chai.request(server)
        .put('/api/stop?name=node_example')
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.status).to.deep.equal(false);
          done();
        });
    });
  });
  describe('/remove', () => {
    it('should remove the app on PUT /remove', (done) => {
      chai.request(server)
        .put('/api/remove?name=node_example')
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.status).to.deep.equal(true);
          done();
        });
    });
  });
});
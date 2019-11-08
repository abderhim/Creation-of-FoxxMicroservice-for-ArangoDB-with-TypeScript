'use strict';
const joi = require('joi');
const createAuth = require('@arangodb/foxx/auth');
const createRouter = require('@arangodb/foxx/router');
const sessionsMiddleware = require('@arangodb/foxx/sessions');

const auth = createAuth();
const router = createRouter();
const users = module.context.collection('users');
const sessions = sessionsMiddleware({
  storage: module.context.collection('sessions'),
  transport: 'cookie'
});
module.context.use(sessions);
module.context.use(router);

router.get('/whoami', function (req, res) {
  try {
    const user = users.document(req.session.uid);
    res.send({username: user.username});
  } catch (e) {
    res.send({username: null});
  }
})
.description('Returns the currently active username.');

router.get('/login/:username/:password', function (req, res) {
  // This may return a user object or null
  const user = users.firstExample({
    username: req.pathParams.username
  });
  const valid = auth.verify(
    // Pretend to validate even if no user was found
    user ? user.authData : {},
    req.pathParams.password
  );
  if (!valid) res.throw('unauthorized');
  // Log the user in
  req.session.uid = user._key;
  req.sessionStorage.save(req.session);
  res.send({sucess: true});
});

router.get('/logout', function (req, res) {
  if (req.session.uid) {
    req.session.uid = null;
    req.sessionStorage.save(req.session);
  }
  res.send({success: true});
})
.description('Logs the current user out.');

router.post('/signup', function (req, res) {
  const user = req.body;
  try {
    // Create an authentication hash
    user.authData = auth.create(user.password);
    delete user.password;
    const meta = users.save(user);
    Object.assign(user, meta);
  } catch (e) {
    // Failed to save the user
    // We'll assume the UniqueConstraint has been violated
    res.throw('bad request', 'Username already taken', e);
  }
  // Log the user in
  req.session.uid = user._key;
  req.sessionStorage.save(req.session);
  res.send({success: true});
})
.body(joi.object({
  username: joi.string().required(),
  password: joi.string().min(6).max(20).required()
  
}).required(), 'Credentials')
.description('Creates a new user and logs them in.');
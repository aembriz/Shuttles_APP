var db = require('../models')

exports.create = function(req, res) {
  db.User.create({ username: req.param('username') }).success(function() {
    res.redirect('/')
  })
}


exports.login = function(req, res) {
	res.send({ error: '', name: 'Usuario prueba', email: 'mail@prueba.com', apiKey: 'RFTJHDL77766KJSD', createdAt: '' })
}

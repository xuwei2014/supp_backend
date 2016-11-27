var express = require('express');
var router = express.Router();

/*
 * GET userlist.
 */
router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

/*
 * GET user.
 */
router.get('/user', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');
    console.log(req.query.name);
    console.log(req.query.partner);
    collection.findOne({ "Name" : req.query.name, "Partner" : req.query.partner}, {}, function(e,doc){
        res.json(doc);
    });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');
    collection.insert(JSON.parse(req.body.info), function(err, result){
        res.send(
            (err === null) ? { msg: result._id } : { msg: err }
        );
    });
});


/*
 * POST to updateuser.
 */
router.post('/updateuser', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');
    collection.update({"_id": req.body.id}, JSON.parse(req.body.info), function(err, result){
        res.send(
            (err === null) ? { msg: result } : { msg: err }
        );
    });
});

/*
 * POST to update linked id.
 */
router.post('/updatelinkedid', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');
    collection.update({"_id": req.body.id}, {$set: {"linkedId" : req.body.linkedId}}, function(err, result){
        res.send(
            (err === null) ? { msg: result } : { msg: err }
        );
    });
});

module.exports = router;

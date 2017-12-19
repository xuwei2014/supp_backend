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
 * GET user by id.
 */
router.get('/userid', function(req, res) {
    var db = req.db;
    var collection = db.get('userlist');
    console.log(req.query.id);
    collection.findOne({ "_id" : req.query.id}, {}, function(e,doc){
        res.json(doc);
    });
});

/*
 * GET usable for phone number
 */
router.get('/phoneno', function(req, res) {
  var db = req.db;
  var collection = db.get('phoneno');
  console.log("phoneno:" + req.query.no);
  collection.findOne({ "no" : req.query.no}, {}, function(e,doc){
      var oneWeek = 7 * 24 * 60 * 60 * 1000;
      var now = new Date().getTime();
      if (doc != null) {
        var interval = now - doc.time;
        console.log("last time" + doc.time);
        if (interval < oneWeek) {
          res.send({usable: false});
        } else {
          updateTime(collection, now, req, res);
        }
      } else {
        updateTime(collection, now, req, res);
      }
  });
});

function updateTime(collection, now, req, res) {
  collection.update({"no":req.query.no}, {"time":now, "no":req.query.no}, {upsert:true, w: 1}, function(err, result) {
      res.send (
        (err === null) ? {usable: true, msg: "success"} : {usable: false, msg: err}
      );
  });
}

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

/*
 * POST to push notification
 */
router.post('/notify', function(req, res) {
    var apn = req.apn;
    var options = {
      token: {
        key: req.certpath + "/key.p8",
        keyId: "F9Q3WHZ2FT",
        teamId: "2ND3U98YXB",
      },
      production: true,
    };
    var apnProvider = new apn.Provider(options);

    var db = req.db;
    var collection = db.get('userlist');
    console.log(req.query.id);
    collection.findOne({ "_id" : req.body.id}, {}, function(e,doc){
        var deviceToken = doc.Token;
        var note = new apn.Notification();

        note.expiry = Math.floor(Date.now() / 1000) + 3600 * 24 * 2; // Expires 2 days from now.
        note.badge = 1;
        note.sound = "ping.aiff";
        note.alert = doc.Partner + " has completed the Relationship Booster! Open now to see the results!";
        note.payload = {'messageFrom': doc.linkedId};
        note.topic = "com.stokleymarcus.TuneUp";

        apnProvider.send(note, deviceToken).then( (result) => {
            console.log(result);
            res.send("hello");
        });

    });
});

router.post('/notifyAndroid', function(req, res) {
    var gcm = require('node-gcm');
    var sender = new gcm.Sender('AAAAn9-McJQ:APA91bGbM0_72T1Pqg-Y-oHzAU-OKlRd-F1uBIB-gyws-Hw4BzHFfPFx0gVwUw9N1cJHfY2r46jNqspGmQhitkNaPpHwGiEXaFqFj0lfvOrZBDXvwkHH1t5q_OSpQC8zf30DM2sTldHg');

    var db = req.db;
    var collection = db.get('userlist');
    console.log(req.body.id);
    collection.findOne({ "_id" : req.body.id}, {}, function(e,doc){
        var deviceToken = doc.Token;

        var message = new gcm.Message({
	    data : { finished : "User2 finished!"},
	    notification : {
		body : doc.Partner + " has completed the Relationship Booster! Open now to see the results!"
	    }
	});

	var regTokens = [deviceToken];

	sender.send(message, { registrationTokens: regTokens }, function (err, response) {
	        if (err) {
		    console.error(err);
		} else {
		    console.log(response);
		    res.send("hello");
		}
	});
    });

});

module.exports = router;

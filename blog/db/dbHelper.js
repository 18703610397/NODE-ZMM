var entries = require('./jsonRes');
var mongoose = require('./db.js');
var User = require('./schema/user');
var News = require('./schema/news');

exports.findUsr = function(data, cb) {

    User.findOne({
        username: data.usr
    }, function(err, doc) {
        var user = (doc !== null) ? doc.toObject() : '';

        if (err) {
            console.log(err)
        } else if (doc === null) {
            entries.code = 99;
            entries.msg = '用户名错误！';
            cb(false, entries);
        } else if (user.password !== data.pwd) {
            entries.code = 99;
            entries.msg = '密码错误！';
            cb(false, entries);
        } else if (user.password === data.pwd) {
            entries.data = user;
            entries.code = 0;
            cb(true, entries);
        }
    })
};

exports.addUser = function(data, cb) {

    var user = new User({
        username: data.usr,
        password: data.pwd,
        email: data.email,
        adr: data.adr
    });

    user.save(function(err, doc) {
        if (err) {
            cb(false, err);
        } else {
            cb(true, entries);
        }
    })
};
exports.addNews = function(data, cb) {

    data.content = md.render(data.content);

    var news = new News({
        title: data.newsTitle,
        content: data.newsContent,
        author:data.id
    });

    news.save(function(err,doc){
        if (err) {
            cb(false,err);
        }else{
            cb(true,entries);
        }
    })
};

exports.findNews = function(req, cb) {
    // News.findOne({
    //    content: data.newsContent
    // }, function(err, doc) {
    //     var news = (doc !== null) ? doc.toObject() : '';
    //     if (err) {
    //         console.log(err)
    //     } else if (doc !== null) {
    //         if (news.title !== data.newsTitle) {
    //             entries.code = 99;
    //             entries.msg = '密码错误！';
    //             cb(false, entries);
    //         } else if (news.title === data.newsTitle) {
    //             entries.data = user;
    //             entries.code = 0;
    //             cb(true, entries);
    //         }
    //     } else {
    //         entries.code = 99;
    //         entries.msg = '用户名错误！';
    //         cb(false, entries);
    //     }
    // });
//     var page = req.query.page || 1 ;
//     this.pageQuery(page, PAGE_SIZE, News, 'author', {}, {
//         created_time: 'desc'
//     }, function(error, data){
//         if(error){
//             next(error);
//         }else{
//             cb(true,data);
//         }
//     });
// };
    News.find()
        .populate('author')
        .exec(function (err, docs) {

            var newsList = new Array();
            for (var i = 0; i < docs.length; i++) {
                newsList.push(docs[i].toObject());
            }
            cb(true, newsList);
        });
};
// var page = req.query.page || 1 ;
// this.pageQuery(page, PAGE_SIZE, News, 'author', {}, {
//     created_time: 'desc'
// }, function(error, data){
//     if(error){
//         next(error);
//     }else{
//         cb(true,data);
//     }
// });
//
// exports.findNewsOne = function(req, id, cb) {
//     News.findOne({_id: id})
//         .populate('author')
//         .exec(function(err, docs) {
//             cb(true,docs.toObject());
//         });
// };



exports.pageQuery = function (page, pageSize, Model, populate, queryParams, sortParams, callback) {
    var start = (page - 1) * pageSize;
    var $page = {
        pageNumber: page
    };
    async.parallel({
        count: function (done) {  // 查询数量
            Model.count(queryParams).exec(function (err, count) {
                done(err, count);
            });
        },
        records: function (done) {   // 查询一页的记录
            Model.find(queryParams).skip(start).limit(pageSize).populate(populate).sort(sortParams).exec(function (err, doc) {
                done(err, doc);
            });
        }
    }, function (err, results) {

        var newsList=new Array();
        for(var i=0;i<results.records.length;i++) {
            newsList.push(results.records[i].toObject());
        }

        var count = results.count;
        $page.pageCount = parseInt((count - 1) / pageSize + 1);
        $page.results = newsList;
        $page.count = count;
        callback(err, $page);
    });
};
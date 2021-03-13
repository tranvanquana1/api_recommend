"use strict";

const Movie = require("../models/movie.model")
const async = require('async')
const validator = require('validator')
const utils = require('../services/utils')



exports.list = function (req, res, next) {
  var keyword = req.query.keyword || null;
  var status = req.query.status || null;

  var page_index = req.params.page_index || 1;
  var page_size = req.params.page_size || 10;

  page_index = parseInt(page_index);
  page_size = parseInt(page_size);
  var offset = page_size * (page_index - 1);

  var query = {};
  var status_deleted = [2];

  if (status != null) {
    query.status = status;
  }

  query.status = { $nin: status_deleted };

  //check theo tên khách mời
  if (keyword != null) {
    keyword = utils.escapeRegExp(keyword);
    query["$and"] = [
      {
        $or: [
          { title: new RegExp(keyword, "i") },
        ],
      },
    ];
  }

  async.series(
    [
      function (cb) {
        Movie.find()
          .where(query)
          .sort({ created_at: -1 })
          .limit(page_size)
          .skip(offset)
          .lean()
          .exec(function (err, movies) {
            if (err) {
              return res.json({
                code: 400,
                message: err.message,
                data: null,
              });
            } else {
              cb(null, {
                code: 200,
                message: "Danh sach movie",
                data: movies,
              });
            }
          });
      },
      function (cb) {
        Movie.where(query).count(function (err, count) {
          if (err) {
            cb(null, 0);
          } else {
            cb(null, count);
          }
        });
      },
    ],

    function (err, results) {
      results[0].meta = {
        page_index: page_index,
        page_size: page_size,
        total_record: results[1],
        total_page: Math.ceil(results[1] / page_size),
      };
      res.json(results[0]);
    }
  );
};

exports.store = function (req, res, next) {
  var title = req.body.title;
  var IMDb_URL = req.body.IMDb_URL || null;
  var release_date = req.body.release_date || null;
  var video_release_date = req.body.video_release_date || null;
  var status = req.body.status || 0;
  var category = req.body.category || [];

  if (validator.isEmpty(title)) {
        return res.json({
              message: 'title is not null',
              data: null
        })
  }

  var movie = new Movie();
  movie.title = title;
  movie.IMDb_URL = IMDb_URL;
  movie.release_date = release_date;
  movie.video_release_date = video_release_date;
  movie.status = status;
  movie.category = category

  movie.save(function (err, result) {
    console.log(result);
    if (err) {
      return res.json({
        code: 500,
        message: err.message,
        data: null,
      });
    } else {
      return res.json({
        code: 200,
        message: "Them moi movie thanh cong",
        data: result,
      });
    }
  });
};

exports.update = function (req, res, next) {
  var params = {
      _id: req.body._id,
      title : req.body.title,
      IMDb_URL : req.body.IMDb_URL || null,
      release_date : req.body.release_date || null,
      video_release_date : req.body.video_release_date || null,
      status : req.body.status || 0,
      category : req.body.category || [],
  };

  async.waterfall(
    [
      function (cb) {
        if (validator.isEmpty(params._id)) {
          cb({
            code: 400,
            message: "Truyen thieu tham so _id",
            data: null,
          });
        } else {
          cb();
        }
      },

      function (cb) {
        if (!validator.isMongoId(params._id)) {
          cb({
            code: 400,
            message: "_id khong hop le",
            data: null,
          });
        } else {
          cb();
        }
      },

      function (cb) {
        if (validator.isEmpty(params.title)) {
          cb({
            code: 400,
            message: "Thiếu tham số title",
            data: null,
          });
        } else {
          cb();
        }
      },
      function (cb) {
        cb();
      },
    ],
    function (err, results) {
      if (err) {
        return res.json({
          code: 400,
          message: err.message,
          data: null,
        });
      } else {
        Movie.findOne({ _id: params._id }).exec(function (err, movie) {
          if (movie == null) {
            return res.json({
              code: 400,
              message: err.message,
              data: null,
            });
          } else {
            movie.title = params.title;
            movie.IMDb_URL = params.IMDb_URL;
            movie.release_date = params.release_date;
            movie.video_release_date = params.video_release_date;
            movie.status = params.status;
            movie.category = params.category

            movie.save((err, result) => {
              if (err) {
                return res.json({
                  code: 400,
                  message: err.message,
                  data: null,
                });
              } else {
                return res.json({
                  code: 200,
                  message: "update thành công",
                  data: result,
                });
              }
            });
          }
        });
      }
    }
  );
};

exports.delete = function (req, res, next) {
  var _id = req.body._id;

  if (validator.isEmpty(_id)) {
    return res.json({
      code: 400,
      message: "Truyền thiếu tham số _id",
      data: null,
    });
  }

  if (!validatior.isMongoId(_id)) {
    return res.json({
      code: 400,
      message: "_id không hợp lệ",
      data: null,
    });
  }

  Movie.findOne({ _id: _id }).exec(function (err, movie) {
    if (err) {
      return res.json({
        code: 400,
        message: err.message,
        data: null,
      });
    } else {
      if (!movie) {
        return res.json({
          code: 400,
          message: "movie không tồn tại.",
          data: null,
        });
      } else {
        movie.status = 2;
        movie.save(function (err, result) {
          if (err) {
            return res.json({
              code: 400,
              message: err.message,
              data: null,
            });
          } else {
            return res.json({
              code: 200,
              message: "Xóa thành công",
              data: null,
            });
          }
        });
      }
    }
  });
};

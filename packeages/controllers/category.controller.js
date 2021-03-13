"use strict";

const Category = require("../models/category.model");
const async = require("async");
const validator = require("validator");
const utils = require("../services/utils");

exports.list = function (req, res, next) {
  var keyword = req.query.keyword || null;
  var status = req.params.status || null;

  var page_index = req.params.page_index || 1;
  var page_size = req.params.page_size || 10;

  page_index = parseInt(page_index);
  page_size = parseInt(page_size);
  var offset = page_size * (page_index - 1);

  var query = {};

  var status_deleted = 2;
  query.status = { $nin: status_deleted };

  //check theo tên khách mời
  if (keyword != null) {
    keyword = utils.escapeRegExp(keyword);
    query["$and"] = [
      {
        $or: [
          { name: new RegExp(keyword, "i") },
          { code: new RegExp(keyword, "i") },
        ],
      },
    ];
  }

  async.series(
    [
      function (cb) {
        Category.find()
          .where(query)
          .limit(page_size)
          .skip(offset)
          .lean()
          .exec(function (err, categorys) {
            if (err) {
              return res.json({
                code: 400,
                message: err.message,
                data: null,
              });
            } else {
              cb(null, {
                code: 200,
                message: "Danh sách món ăn",
                data: categorys,
              });
            }
          });
      },
      function (cb) {
        Category.where(query).count(function (err, count) {
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
  var name = req.body.name;
  var code = req.body.code || null;

  if (validator.isEmpty(name)) {
    return res.json({
      code: 400,
      message: "Thiếu tham số name",
      data: null,
    });
  }

  var cate = new Category();
  cate.name = name;
  cate.code = code;
  cate.save(function (err, result) {
    console.log(result);
    if (err) {
      return res.json({
        code: 400,
        message: err.message,
        data: null,
      });
    } else {
      return res.json({
        code: 200,
        message: "Them moi thanh cong",
        data: result,
      });
    }
  });
};

exports.update = function (req, res, next) {
  var params = {
    _id: req.body._id,
    name: req.body.name || null,
    code: req.body.code || null,
    status: req.body.status || 0,
  };

  async.waterfall(
    [
      function (cb) {
        console.log(params._id);
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
        Category.findOne({ _id: params._id }).exec(function (err, category) {
          if (category == null) {
            return res.json({
              code: 400,
              message: err.message,
              data: null,
            });
          } else {
            category.name = params.name;
            category.code = params.code;
            category.status = params.status;

            category.save(function (err, result) {
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

  if (!validator.isMongoId(_id)) {
    return res.json({
      code: 400,
      message: "_id không hợp lệ",
      data: null,
    });
  }

  Category.findOne({ _id: _id }).exec(function (err, category) {
    if (err) {
      return res.json({
        code: 400,
        message: err.message,
        data: null,
      });
    } else {
      if (!category) {
        return res.json({
          code: 400,
          message: "_id không tồn tại.",
          data: null,
        });
      } else {
        category.status = 2;
        category.save(function (err, result) {
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

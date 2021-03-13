"use strict";

const User = require("../models/user.model");
const async = require("async");
const validator = require("validator");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const utils = require("../services/utils");

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
          { username: new RegExp(keyword, "i") },
          { fullname: new RegExp(keyword, "i") },
          { mobile: new RegExp(keyword, "i") },
        ],
      },
    ];
  }

  console.log(query);
  async.series(
    [
      function (cb) {
        User.find()
          .where(query)
          .sort({ created_at: -1 })
          .limit(page_size)
          .skip(offset)
          .lean()
          .exec(function (err, users) {
            if (err) {
              return res.json({
                code: 400,
                message: err.message,
                data: null,
              });
            } else {
              cb(null, {
                code: 200,
                message: "Danh sach user",
                data: users,
              });
            }
          });
      },
      function (cb) {
        User.where(query).count(function (err, count) {
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
  var username = req.body.username;
  var password = req.body.password;
  var fullname = req.body.fullname || null;
  var mobile = req.body.mobile || null;
  var status = req.body.status || 0;
  var movies = req.body.movies || [];

  var user = new User();
  user.username = username;
  user.password = password;
  user.fullname = fullname;
  user.mobile = mobile;
  user.status = status;
  user.movies = movies

  user.save(function (err, result) {
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
        message: "Them moi user thanh cong",
        data: result,
      });
    }
  });
};

exports.update = function (req, res, next) {
  var params = {
    _id: req.body._id,
    username: req.body.username,
    fullname: req.body.fullname || null,
    mobile: req.body.mobile || null,
    status: req.body.status || 0,
    movies: req.body.movies || [],
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
        if (validator.isEmpty(params.username)) {
          cb({
            code: 400,
            message: "Thiếu tham số username",
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
        User.findOne({ _id: params._id }).exec(function (err, user) {
          if (user == null) {
            return res.json({
              code: 400,
              message: err.message,
              data: null,
            });
          } else {
            user.username = params.username;
            user.fullname = params.fullname;
            user.mobile = params.mobile;
            user.status = params.status;
            user.movies = params.movies;

            user.save((err, result) => {
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


exports.update_movie = function (req, res, next) {
  var params = {
    _id: req.body._id,
    movies: req.body.movies || [],
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
        if (validator.isEmpty(params.username)) {
          cb({
            code: 400,
            message: "Thiếu tham số username",
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
        User.findOne({ _id: params._id }).exec(function (err, user) {
          if (user == null) {
            return res.json({
              code: 400,
              message: err.message,
              data: null,
            });
          } else {
            user.movies = params.movies;

            user.save((err, result) => {
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

  User.findOne({ _id: _id }).exec(function (err, user) {
    if (err) {
      return res.json({
        code: 400,
        message: err.message,
        data: null,
      });
    } else {
      if (!user) {
        return res.json({
          code: 400,
          message: "user không tồn tại.",
          data: null,
        });
      } else {
        user.status = 2;
        user.save(function (err, result) {
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


exports.signup = function(req, res) {
  const params = {
    username: req.body.username,
    password: req.body.password,
    fullname: req.body.fullname || null,
    mobile: req.body.mobile || null,
    status: req.body.status || 0,
    movies: req.body.movies || [],
  }

  console.log('params ', params)

  // Check null
  if (validator.isEmpty(params.username)) {
    return res.json({
      message: "thieu tham so username",
      data: null
    })
  }

  if (validator.isEmpty(params.password)) {
    return res.json({
      message: "thieu tham so password",
      data: null
    })
  }

  User.find({ username: params.username }).exec(function (err, users) {

    if (err) {
      return res.json({
        message: err,
        data: null
      })
    } else  {
      if (users.length !== 0) {
      return res.json({
        message: "username da ton tai",
        data: null
      })
    } else {
        var user = new User()
        user.username = params.username;
        user.password = bcrypt.hashSync(params.password, 10);
        user.fullname= params.fullname;
        user.mobile= params.mobile;
        user.status= params.status;
        user.movies = params.movies;
        
        user.save(function (err, result) {
          if (err) {
            console.log('err save')
            return res.json({
              message: err,
              data: null
            })
          } else {
            return res.json({
              message: 'Dang ky thanh cong',
              data: result
            })
          }
        })
    }
    }
  })
}


exports.signin = function (req, res, next) {
  const params = {
    username: req.body.username,
    password: req.body.password,
  }


  if (validator.isEmpty(params.username)) {
    return res.json({
      message: 'username khong duoc nhap',
      data: null
    })
  }

  User.findOne({ username: params.username }).exec(function (err, user) {
    if (err) {
      return res.json({
        message: err,
        data: null
      })
    } else {
      if (!user) {
        return res.json({
          message: 'Tai khoan mat khau khong chinh xac',
          data: null
        })
      } else {
        const passwordIsValid = bcrypt.compareSync(params.password, user.password)
        if (!passwordIsValid) {
          return res.json({
            message: 'Mat khau khong chinh xac',
            data: null
          })
        } else {
          console.log(user.token)
          if (!user.token) {
            // chua co token thi sinh token
            user.token = jwt.sign({username: params.username}, process.env.SECRET_KEY, {algorithm: 'HS256'}, {expiresIn: '24h'})
            console.log("user", user)            
          }

          user.save(function (err, result) {
            console.log(result)
            if (err) {
              return res.json({
                message: err,
                data: null
              })
            } else {
              var jsonData = result.toObject();

              // Xoa cac truong password
              delete jsonData.password

              return res.json({
                message: 'Dang nhap thanh cong',
                data: jsonData
              })
            }
          })

        }

      }
    }
  })
}

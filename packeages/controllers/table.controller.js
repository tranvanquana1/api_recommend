// "use strict";

// const Table = require("../models/table.model");
// const async = require("async");
// const validatior = require("validator");
// const utils = require("../services/utils");

// exports.list = function (req, res, next) {
//   var keyword = req.query.keyword || null;
//   var name = req.query.name || null;
//   var code = req.query.code || null;
//   var zone = req.query.zone || null;
//   var status = req.query.status || null;

//   // Tính toán phân trang
//   var page_index = req.params.page_index || 1;
//   var page_size = req.params.page_size || 10;

//   page_index = parseInt(page_index);
//   page_size = parseInt(page_size);
//   var offset = page_size * (page_index - 1);

//   var query = {};

//   var status_deleted = 2;
//   query.status = { $nin: status_deleted };

//   // if (name != null) {
//   //   query.name = name;
//   // }

//   // if (code != null) {
//   //   query.code = code;
//   // }

//   // if (zone != null) {
//   //   query.zone = zone;
//   // }

//   if (status != null) {
//     query.status = status;
//   }

//   //check theo tên khách mời
//   if (keyword != null) {
//     keyword = utils.escapeRegExp(keyword);
//     query["$and"] = [
//       {
//         $or: [
//           { name: new RegExp(keyword, "i") },
//           { code: new RegExp(keyword, "i") },
//           { zone: new RegExp(keyword, "i") },
//         ],
//       },
//     ];
//   }

//   async.series(
//     [
//       function (cb) {
//         Table.find()
//           .where(query)
//           .limit(page_size)
//           .skip(offset)
//           .lean()
//           .exec(function (err, tables) {
//             if (err) {
//               return res.json({
//                 code: 400,
//                 message: err.message,
//                 data: null,
//               });
//             } else {
//               cb(null, {
//                 code: 200,
//                 message: "Danh sach bàn ăn",
//                 data: tables,
//               });
//             }
//           });
//       },
//       function (cb) {
//         Table.where(query).count(function (err, count) {
//           if (err) {
//             cb(null, 0);
//           } else {
//             cb(null, count);
//           }
//         });
//       },
//     ],

//     function (err, results) {
//       results[0].meta = {
//         page_index: page_index,
//         page_size: page_size,
//         total_record: results[1],
//         total_page: Math.ceil(results[1] / page_size),
//       };
//       res.json(results[0]);
//     }
//   );
// };

// exports.store = function (req, res, next) {
//   var name = req.body.name;
//   var code = req.body.code || null;
//   var zone = req.body.zone || null;

//   if (validatior.isEmpty(name)) {
//     return res.json({
//       code: 400,
//       message: "Thiếu tham số name",
//       data: null,
//     });
//   }

//   var table = new Table();
//   table.name = name;
//   table.code = code;
//   table.zone = zone;
//   table.save(function (err, result) {
//     console.log(result);
//     if (err) {
//       return res.json({
//         code: 400,
//         message: err.message,
//         data: null,
//       });
//     } else {
//       return res.json({
//         code: 200,
//         message: "Them moi thanh cong",
//         data: result,
//       });
//     }
//   });
// };

// exports.update = function (req, res, next) {
//   var params = {
//     _id: req.body._id,
//     name: req.body.name || null,
//     code: req.body.code || null,
//     zone: req.body.zone || null,
//     status: req.body.status || 0,
//   };

//   async.waterfall(
//     [
//       function (cb) {
//         console.log(params._id);
//         if (validatior.isEmpty(params._id)) {
//           cb({
//             code: 400,
//             message: "Truyen thieu tham so _id",
//             data: null,
//           });
//         } else {
//           cb();
//         }
//       },

//       function (cb) {
//         if (!validatior.isMongoId(params._id)) {
//           cb({
//             code: 400,
//             message: "_id khong hop le",
//             data: null,
//           });
//         } else {
//           cb();
//         }
//       },
//       function (cb) {
//         cb();
//       },
//     ],
//     function (err, results) {
//       if (err) {
//         return res.json({
//           code: 400,
//           message: err.message,
//           data: null,
//         });
//       } else {
//         Table.findOne({ _id: params._id }).exec(function (err, table) {
//           if (table == null) {
//             return res.json({
//               code: 400,
//               message: err.message,
//               data: null,
//             });
//           } else {
//             table.name = params.name;
//             table.code = params.code;
//             table.zone = params.zone;
//             table.status = params.status;

//             table.save(function (err, result) {
//               if (err) {
//                 return res.json({
//                   code: 400,
//                   message: err.message,
//                   data: null,
//                 });
//               } else {
//                 return res.json({
//                   code: 200,
//                   message: "update thành công",
//                   data: result,
//                 });
//               }
//             });
//           }
//         });
//       }
//     }
//   );
// };

// exports.delete = function (req, res, next) {
//   var _id = req.body._id;

//   if (validatior.isEmpty(_id)) {
//     return res.json({
//       code: 400,
//       message: "Truyền thiếu tham số _id",
//       data: null,
//     });
//   }

//   if (!validatior.isMongoId(_id)) {
//     return res.json({
//       code: 400,
//       message: "_id không hợp lệ",
//       data: null,
//     });
//   }

//   Table.findOne({ _id: _id }).exec(function (err, table) {
//     if (err) {
//       return res.json({
//         code: 400,
//         message: err.message,
//         data: null,
//       });
//     } else {
//       if (!table) {
//         return res.json({
//           code: 400,
//           message: "user không tồn tại.",
//           data: null,
//         });
//       } else {
//         table.status = 2;
//         table.save(function (err, result) {
//           if (err) {
//             return res.json({
//               code: 400,
//               message: err.message,
//               data: null,
//             });
//           } else {
//             return res.json({
//               code: 200,
//               message: "Xóa thành công",
//               data: null,
//             });
//           }
//         });
//       }
//     }
//   });
// };

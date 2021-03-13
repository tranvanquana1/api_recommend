// "use strict";

// const Bill = require("../models/bill.model");
// const async = require("async");
// const validatior = require("validator");
// const utils = require("../services/utils");

// exports.list = function (req, res, next) {
//   var table = req.query.table || null;
//   var keyword = req.query.keyword || null;
//   var status = req.query.status || null;

//   var page_index = req.params.page_index || 1;
//   var page_size = req.params.page_size || 10;

//   page_index = parseInt(page_index);
//   page_size = parseInt(page_size);
//   var offset = page_size * (page_index - 1);

//   var query = {};
//   var status_deleted = [1, 2];

//   if (status != null && parseInt(status) >= 0) {
//     query.status = parseInt(status);
//   } else {
//     query.status = { $nin: status_deleted };
//   }

//   if (table != null) {
//     if (!validatior.isMongoId(table)) {
//       return res.json({
//         code: 400,
//         message: "table không hợp lệ",
//         data: null,
//       });
//     } else {
//       query.table = table;
//     }
//   }

//   //check theo tên khách mời
//   if (keyword != null) {
//     keyword = utils.escapeRegExp(keyword);
//     query["$and"] = [
//       {
//         $or: [
//           { customer_name: new RegExp(keyword, "i") },
//           { customer_mobile: new RegExp(keyword, "i") },
//           { created_by: new RegExp(keyword, "i") },
//         ],
//       },
//     ];
//   }

//   console.log(query);

//   async.series(
//     [
//       function (cb) {
//         Bill.find()
//           .where(query)
//           .limit(page_size)
//           .skip(offset)
//           .lean()
//           .populate("table", "name zone")
//           .populate({
//             path: "food.food_detail",
//             populate: { path: "category", select: "name status" },
//             select: "name price status",
//           })
//           .exec(function (err, bills) {
//             if (err) {
//               return res.json({
//                 code: 400,
//                 message: err.message,
//                 data: null,
//               });
//             } else {
//               cb(null, {
//                 code: 200,
//                 message: "Danh sách hóa đơn",
//                 data: bills,
//               });
//             }
//           });
//       },
//       function (cb) {
//         Bill.where(query).count(function (err, count) {
//           if (err) {
//             cb(null, 0);
//           } else {
//             cb(null, count);
//           }
//         });
//       },
//     ],

//     function (err, results) {
//       var temp = [];
//       var total = 0;
//       results[0].data.map((item) => {
//         item.food.map((fd) => {
//           total += fd.quantity * fd.food_detail.price;
//         });
//         item.table_name = item.table.name + "-" + item.table.zone;
//         item.total = total;
//         console.log(total);

//         temp.push(item);
//       });

//       results[0].data = temp;
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

// exports.get = function (req, res, next) {
//   //var user = req.user;
//   const _id = req.query._id;

//   // Check id bắt buộc nhập
//   if (validatior.isEmpty(_id)) {
//     return res.json({
//       code: 400,
//       message: "Thiếu tham số _id",
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

//   Bill.findOne({ _id: _id })
//     .lean()
//     .populate("table", "name zone")
//     .populate({
//       path: "food.food_detail",
//       populate: { path: "category", select: "name status" },
//       select: "name price status",
//     })
//     .exec(function (err, bills) {
//       if (err) {
//         return res.json({
//           code: 400,
//           message: err.message,
//           data: null,
//         });
//       } else {
//         if (!bills) {
//           return res.json({
//             code: 400,
//             message: "_id không tồn taij",
//             data: null,
//           });
//         } else {
//           return res.json({
//             code: 200,
//             message: "Chi tiết hóa đơn",
//             data: bills,
//           });
//         }
//       }
//     });
// };

// exports.store = function (req, res, next) {
//   var table = req.body.table;
//   var customer_name = req.body.customer_name || null;
//   var customer_mobile = req.body.customer_mobile || null;
//   var food = req.body.food || [];
//   var total = req.body.total || null;

//   if (validatior.isEmpty(table)) {
//     return res.json({
//       code: 400,
//       message: "Thiếu tham số table",
//       data: null,
//     });
//   }

//   // if (validatior.isEmpty(customer_name)) {
//   //   return res.json({
//   //     code: 400,
//   //     message: "Thiếu tham số customer_name",
//   //     data: null,
//   //   });
//   // }

//   if (!validatior.isMongoId(table)) {
//     return res.json({
//       code: 400,
//       message: "_id không hợp lệ",
//       data: null,
//     });
//   }

//   var bill = new Bill();
//   bill.table = table;
//   bill.customer_name = customer_name;
//   bill.customer_mobile = customer_mobile;
//   bill.food = Array.isArray(food) ? food : [];
//   bill.total = total;

//   bill.save(function (err, result) {
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
//   var _id = req.body._id;
//   var table = req.body.table;
//   var customer_name = req.body.customer_name;
//   var customer_mobile = req.body.customer_mobile || null;
//   var food = req.body.food || [];
//   var status = req.body.status || 0;

//   async.waterfall(
//     [
//       function (cb) {
//         if (validatior.isEmpty(_id)) {
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
//         if (!validatior.isMongoId(_id)) {
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
//         if (validatior.isEmpty(table)) {
//           cb({
//             code: 400,
//             message: "Truyen thieu tham so table",
//             data: null,
//           });
//         } else {
//           cb();
//         }
//       },

//       function (cb) {
//         if (!validatior.isMongoId(table)) {
//           cb({
//             code: 400,
//             message: "table khong hop le",
//             data: null,
//           });
//         } else {
//           cb();
//         }
//       },

//       function (cb) {
//         if (validatior.isEmpty(customer_name)) {
//           cb({
//             code: 400,
//             message: "Truyen thieu tham so customer_name",
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
//         Bill.findOne({ _id: _id }).exec(function (err, bill) {
//           if (err) {
//             return res.json({
//               code: 400,
//               message: err.message,
//               data: null,
//             });
//           } else {
//             bill.table = table;
//             bill.customer_name = customer_name;
//             bill.customer_mobile = customer_mobile;
//             bill.food = Array.isArray(food) ? food : [];
//             bill.status = status;

//             bill.save(function (err, result) {
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

// exports.update_food = function (req, res, next) {
//   var _id = req.body._id;
//   var food = req.body.food;

//   async.waterfall(
//     [
//       function (cb) {
//         if (validatior.isEmpty(_id)) {
//           return res.json({
//             code: 400,
//             message: "Truyền thiếu tham số _id",
//             data: null,
//           });
//         } else {
//           cb();
//         }
//       },
//       function (cb) {
//         if (!validatior.isMongoId(_id)) {
//           return res.json({
//             code: 400,
//             message: "_id không hợp lệ",
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
//         Bill.findOne({ _id: _id }).exec(function (err, bill) {
//           if (err) {
//             return res.json({
//               code: 400,
//               message: err.message,
//               data: null,
//             });
//           } else {
//             if (!bill) {
//               return res.json({
//                 code: 400,
//                 message: "_id không tồn tại",
//                 data: null,
//               });
//             } else {
//               var new_arr = bill.food.concat(food);
//               bill.food = new_arr;
//               bill.save(function (err, result) {
//                 if (err) {
//                   return res.json({
//                     code: 400,
//                     message: err.message,
//                     data: null,
//                   });
//                 } else {
//                   return res.json({
//                     code: 200,
//                     message: "Update thành công",
//                     data: result,
//                   });
//                 }
//               });
//             }
//           }
//         });
//       }
//     }
//   );
// };

// exports.update_status = function (req, res, next) {
//   var _id = req.body._id;
//   var status = req.body.status || null;

//   console.log("status", req.body);

//   async.waterfall(
//     [
//       function (cb) {
//         if (validatior.isEmpty(_id)) {
//           return res.json({
//             code: 400,
//             message: "Truyền thiếu tham số _id",
//             data: null,
//           });
//         } else {
//           cb();
//         }
//       },
//       function (cb) {
//         if (!validatior.isMongoId(_id)) {
//           return res.json({
//             code: 400,
//             message: "_id không hợp lệ",
//             data: null,
//           });
//         } else {
//           cb();
//         }
//       },

//       function (cb) {
//         if (!status) {
//           return res.json({
//             code: 400,
//             message: "Truyền thiếu tham số status",
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
//         Bill.findOne({ _id: _id }).exec(function (err, bill) {
//           if (err) {
//             return res.json({
//               code: 400,
//               message: err.message,
//               data: null,
//             });
//           } else {
//             if (!bill) {
//               return res.json({
//                 code: 400,
//                 message: "_id không tồn tại",
//                 data: null,
//               });
//             } else {
//               bill.status = status;
//               console.log(status);
//               bill.save(function (err, result) {
//                 if (err) {
//                   return res.json({
//                     code: 400,
//                     message: err.message,
//                     data: null,
//                   });
//                 } else {
//                   return res.json({
//                     code: 200,
//                     message: "Update thành công",
//                     data: result,
//                   });
//                 }
//               });
//             }
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

//   Bill.findOne({ _id: _id }).exec(function (err, bill) {
//     if (err) {
//       return res.json({
//         code: 400,
//         message: err.message,
//         data: null,
//       });
//     } else {
//       if (!bill) {
//         return res.json({
//           code: 400,
//           message: "_id không tồn tại.",
//           data: null,
//         });
//       } else {
//         bill.status = 2;
//         bill.save(function (err, result) {
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

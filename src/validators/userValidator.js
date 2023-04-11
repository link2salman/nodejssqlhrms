const Joi = require("joi");
const HttpCodes = require("../constants/httpCodes");
const AppMessages = require("../constants/appMessages");
const ErrorResponse = require("../composer/error-response");
const { joiMessageHandler } = require("../helpers/joiMessages");
const { getTodayDateStandardFormat } = require("../helpers/helper");

const standardDateToday = getTodayDateStandardFormat()

exports.validateCreateUser = async (req, res, next) => {
  let { body } = req;
  const schema = Joi.object({
    first_name: Joi.string().required().error(errors => joiMessageHandler("first_name", errors)),
    last_name: Joi.string().required().error(errors => joiMessageHandler("last_name", errors)),
    email: Joi.string().email().required().error(errors => joiMessageHandler("email", errors)),
    contact: Joi.string().required().min(11).max(11).error(errors => joiMessageHandler("contact", errors)),
    role: Joi.number().min(1).max(9).required().error(errors => joiMessageHandler("role", errors)),
    joining_date: Joi.string().required().pattern(new RegExp('[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}')).error(errors => joiMessageHandler("joining date", errors, "yyyy-mm-dd")),
    reporting_to: Joi.string().required().error(errors => joiMessageHandler("reporting to", errors)),
    cnic: Joi.string().required().min(13).max(13).error(errors => joiMessageHandler("cnic", errors)),
    department: Joi.number().min(1).max(9).required().error(errors => joiMessageHandler("department", errors)),
    address: Joi.string().required().error(errors => joiMessageHandler("address", errors)),
    password: Joi.string().required().min(8).max(32).error(errors => joiMessageHandler("password", errors)),
  });
  try {
    await schema.validateAsync(body);
    next();
  } catch (error) {
    return res.status(HttpCodes.FORBIDDEN).send(new ErrorResponse(error.details[0].message.replace(/"/g, "")));
  }
};

exports.validateUpdateUser = async (req, res, next) => {
  let { body } = req;
  const schema = Joi.object({
    first_name: Joi.string().required().error(errors => joiMessageHandler("first_name", errors)),
    last_name: Joi.string().required().error(errors => joiMessageHandler("last_name", errors)),
    contact: Joi.string().required().min(11).max(11).error(errors => joiMessageHandler("contact", errors)),
    cnic: Joi.string().required().min(13).max(13).error(errors => joiMessageHandler("cnic", errors)),
    address: Joi.string().required().error(errors => joiMessageHandler("address", errors)),
    profilepic: Joi.string().required().error(errors => joiMessageHandler("profilepic", errors)),
  });
  try {
    await schema.validateAsync(body);
    next();
  } catch (error) {
    return res.status(HttpCodes.FORBIDDEN).send(new ErrorResponse(error.details[0].message.replace(/"/g, "")));
  }
};

exports.validateChangePassword = async (req, res, next) => {
  let { body } = req;
  const schema = Joi.object({
    email: Joi.string().email().required().error(errors => joiMessageHandler("email", errors)),
    password: Joi.string().required().min(8).max(32).error(errors => joiMessageHandler("password", errors)),
  });
  try {
    await schema.validateAsync(body);
    next();
  } catch (error) {
    return res.status(HttpCodes.FORBIDDEN).send(new ErrorResponse(error.details[0].message.replace(/"/g, "")));
  }
};

exports.validateUserLogin = async (req, res, next) => {
  let { body } = req;
  const schema = Joi.object({
    email: Joi.string().email().required().error(errors => joiMessageHandler("email", errors)),
    password: Joi.string().required().min(8).max(32).error(errors => joiMessageHandler("password", errors)),
  });
  try {
    await schema.validateAsync(body);
    next();
  } catch (error) {
    return res.status(HttpCodes.FORBIDDEN).send(new ErrorResponse(error.details[0].message.replace(/"/g, "")));
  }
};

exports.validateUserAttendance = async (req, res, next) => {
  let { body } = req;
  const schema = Joi.object({
    daytype: Joi.string().required().error(errors => joiMessageHandler("day type", errors)),
    date: Joi.string().required().pattern(new RegExp('[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}')).custom((value, helper) => {
      if (value > standardDateToday) {
        return helper.message('Date cannot be greater than today');
      }
    }).error(errors => joiMessageHandler("date", errors, "yyyy-mm-dd")),
    startTime: Joi.string().min(0).allow('').allow(null).pattern(new RegExp('[0-9]{2}[:][0-9]{2} AM|[0-9]{2}[:][0-9]{2} PM')).error(errors => joiMessageHandler("start Time", errors, "10:30 AM")),
    endTime: Joi.string().min(0).allow('').allow(null).pattern(new RegExp('[0-9]{2}[:][0-9]{2} AM|[0-9]{2}[:][0-9]{2} PM')).error(errors => joiMessageHandler("end Time", errors, "10:30 AM")),
  });

  try {
    await schema.validateAsync(body);
    next();
  } catch (error) {
    return res.status(HttpCodes.FORBIDDEN).send(new ErrorResponse(error.details[0].message.replace(/"/g, "")));
  }
};

exports.validateLeaveRecord = async (req, res, next) => {
  let { body } = req;
  const schema = Joi.object({
    type: Joi.string().required().error(errors => joiMessageHandler("type", errors)),
    category: Joi.string().required().error(errors => joiMessageHandler("categort", errors)),
    date_start: Joi.string().required().custom((value, helper) => {
      if (!value.match(/[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}/g)) {
        return helper.message('date start is not a valid date follow format yyyy-mm-dd');
      }
      if (value < standardDateToday) {
        return helper.message('start date cannot be less than today');
      }
    }),
    date_end: Joi.string().required().custom((value, helper) => {
      if (!value.match(/[0-9]{4}[-]{1}[0-9]{2}[-]{1}[0-9]{2}/g)) {
        return helper.message('end date is not a valid date follow format yyyy-mm-dd');
      }
      if (value < standardDateToday) {
        return helper.message('end date cannot be less than today');
      }
      if (value < body.date_start) {
        return helper.message('end date cannot be less than start date');
      }
    }),
    reason: Joi.string().required().error(errors => joiMessageHandler("reason", errors))
  });

  try {
    await schema.validateAsync(body);
    next();
  } catch (error) {
    return res.status(HttpCodes.FORBIDDEN).send(new ErrorResponse(error.details[0].message.replace(/"/g, "")));
  }
};

exports.validateApproveLeaved = async (req, res, next) => {
  let { body } = req;
  const schema = Joi.object({
    id: Joi.number().required().error(errors => joiMessageHandler("id", errors)),
    actiontype: Joi.string().required().error(errors => joiMessageHandler("actiontype", errors)),
  })
  try {
    await schema.validateAsync(body);
    next();
  } catch (error) {
    return res.status(HttpCodes.FORBIDDEN).send(new ErrorResponse(error.details[0].message.replace(/"/g, "")));
  }
};

exports.validateApproveAttendance = async (req, res, next) => {
  let { body } = req;
  const schema = Joi.object({
    id: Joi.number().required().error(errors => joiMessageHandler("id", errors)),
    actiontype: Joi.string().required().error(errors => joiMessageHandler("actiontype", errors)),
  })
  try {
    await schema.validateAsync(body);
    next();
  } catch (error) {
    return res.status(HttpCodes.FORBIDDEN).send(new ErrorResponse(error.details[0].message.replace(/"/g, "")));
  }
};


const { adapterRequest } = require("../helpers/adapterRequest");
const userService = require("../services/database/userService");
const authHelper = require("../helpers/authHelper");
const HttpCodes = require("../constants/httpCodes");
const AppMessages = require("../constants/appMessages");
const SuccessResponse = require("../composer/success-response");
const ErrorResponse = require("../composer/error-response");
const { timeVarifier, formatTime, leaveHandler } = require("../helpers/helper");
const { dbErrorsMessage } = require("../helpers/dbErrors");

exports.createUser = async (req, res) => {
  let httpRequest = adapterRequest(req);

  try {
    let { body } = httpRequest;
    // let exists = await userService.getUserByEmail(body.email);
    // if (exists) {
    //   return res.status(HttpCodes.BAD_REQUEST).send(new ErrorResponse(AppMessages.APP_DUPLICATE_RECORD));
    // }

    if (body.role == 1) {
      return res.status(HttpCodes.BAD_REQUEST).send(new ErrorResponse(AppMessages.DUPLICATE_ADMIN));
    }

    const password = await authHelper.encryptString(body.password);
    let result = await userService.createUserAccount(body.first_name, body.last_name, body.email, body.contact, body.role, body.joining_date, body.reporting_to, body.cnic, body.department, body.address, password);

    if (result?.code) {
      return dbErrorsMessage(res, result)
    }

    if (result?.length) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.USER_SUCCESSFULY_REGISTERED));
    }

  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.updateUser = async (req, res) => {
  let httpRequest = adapterRequest(req);

  try {
    let id = req.params["id"];
    let { body } = httpRequest;
    let exists = await userService.getUserByID(id);
    if (!exists) {
      return res.status(HttpCodes.BAD_REQUEST).send(new ErrorResponse(AppMessages.APP_RESOURCE_NOT_FOUND));
    }
    let result = await userService.updateUserAccount(id, body.first_name, body.last_name, body.contact, body.cnic, body.address, body.profilepic);
    //Api Call and Compose Response Response
    return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.RECORD_SUCCESSFULY_UPDATED, result));
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.login = async (req, res) => {
  let httpRequest = adapterRequest(req);
  try {
    let { body } = httpRequest;
    let result = await userService.getUserByEmail(body.email);
    //Compose Error Response
    if (!result) {
      return res.status(HttpCodes.BAD_REQUEST).send(new ErrorResponse(AppMessages.APP_ERROR_MSG_IVALID_USERNAME_PASSWORD));
    }

    //Validate Paswword
    const isValidUser = await authHelper.isValidUser(body.password, result.password);

    //Compose Error Response if Password is Invalid.
    if (!isValidUser) {
      return res.status(HttpCodes.BAD_REQUEST).send(new ErrorResponse(AppMessages.APP_ACCESS_DENIED));
    }

    const { resObject, data: { password, ...rest } } = await authHelper.addAuthTokenInResponseHeader(result, res);
    return resObject.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.USER_SUCCESSFULY_LOGEDIN, rest));

  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};


exports.usersList = async (req, res) => {
  try {
    //Api Call and Compose Response Response
    let users = await userService.getUsers();
    return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.SUCCESS, users[0]));
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.getUser = async (req, res) => {
  try {
    //Api Call and Compose Response Response
    let id = req.params["id"];
    let user = await userService.getUserByID(id);
    if (user) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.SUCCESS, user));
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_RESOURCE_NOT_FOUND));
    }
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.deleteUser = async (req, res) => {
  try {
    //Api Call and Compose Response Response
    let id = req.params["id"];
    let user = await userService.getUserByID(id);
    if (user) {
      let result = await userService.deleteUser(id);
      if (result) {
        return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.RECORD_SUCCESSFULY_DELETED));
      }
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_RESOURCE_NOT_FOUND));
    }
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.changeUserPassword = async (req, res) => {
  try {
    const { body } = req;

    let exists = await userService.getUserByID(body.id);
    if (!exists) {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.AppMessages.IVALID_USER_CREDENTIALS));
    }

    let isValidUser = await authHelper.isValidUser(body.oldPassword, exists.password);

    if (!isValidUser) {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_ERROR_MSG_IVALID_USERNAME_PASSWORD));
    }

    let passwordHash = await authHelper.encryptString(body.newPassword);
    let result = await userService.updateUserPassword(body.id, passwordHash);
    //Api Call and Compose Sucess Response Response
    return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.APP_PASSWORD_CHANGED, result));
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.resendOTP = async (req, res) => {
  let httpRequest = adapterRequest(req);

  try {
    let { body } = httpRequest;
    body.otp = await authHelper.generateOTP();
    let result = await userService.updateOTP(body);

    if (!result[0][0].affected_rows || result[0][0].affected_rows === 0) {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(appMessages.ERROR_PIN_GENERATION));
    }

    //Api Call and Compose Response Response
    return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(appMessages.PIN_SUCCESSFULY_GENERATED));
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.confirmOTP = async (req, res) => {
  let httpRequest = adapterRequest(req);

  try {
    let { body } = httpRequest;
    let result = await userService.confirmOTP(body);

    if (!result[0][0].affected_rows || result[0][0].affected_rows === 0) {
      return res.status(HttpCodes.BAD_REQUEST).send(new ErrorResponse(appMessages.ERROR_INVALID_PIN));
    }

    //Api Call and Compose Response Response
    return res.status(HttpCodes.OK).send(new SuccessResponse(appMessages.PIN_SUCCESSFULY_CONFIRMED));
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.getUserRoles = async (req, res) => {
  try {
    //Api Call and Compose Response Response
    let roles = await userService.getRoles();
    if (roles) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.SUCCESS, roles));
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_RESOURCE_NOT_FOUND));
    }
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.getUserDepartments = async (req, res) => {
  try {
    //Api Call and Compose Response Response
    let departments = await userService.getDepartments();
    if (departments) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.SUCCESS, departments));
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_RESOURCE_NOT_FOUND));
    }
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.markAttendance = async (req, res) => {
  const httpRequest = adapterRequest(req);
  try {
    const id = req.params["id"];
    const { body } = httpRequest;
    const dayString = new Date(body.date).toLocaleString('en-us', { weekday: 'long' })

    const time = timeVarifier(body.startTime, body.endTime)
    if (!time) {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.TIMEERROR));
    }

    const checked = await userService.checkAttendance(id, body.date)
    if (checked) {
      const updated = await userService.getUpdateAttendance(id, checked.attendance_id, body.date, dayString, time.startTime, time.endTime)
      if (updated) {
        return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.RECORD_SUCCESSFULY_UPDATED))
      }
    }

    const attendance = await userService.createAttendance(id, body.daytype, body.date, dayString, time.startTime, time.endTime);
    if (attendance) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.RECORD_SUCCESSFULY_UPDATED));
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_ERROR));
    }
  } catch (error) {
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.getUserAttendance = async (req, res) => {
  try {
    let id = req.params["id"];
    let attendance = await userService.getAttendace(id);

    if (attendance?.length) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.SUCCESS, attendance?.map(att => ({ ...att, startTime: att.startTime ? formatTime(att.startTime) : att.startTime, endTime: att.endTime ? formatTime(att.endTime) : att.endTime }))));
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_ERROR));
    }
  } catch (error) {
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.getUserManagers = async (req, res) => {
  try {
    //Api Call and Compose Response Response
    let managers = await userService.getManagers();
    if (managers) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.SUCCESS, managers));
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_ERROR));
    }
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.applyLeave = async (req, res) => {
  const httpRequest = adapterRequest(req);
  try {
    const id = req.params["id"];
    const { body } = httpRequest;
    const days = leaveHandler(body.type, body.date_start, body.date_end)

    const leave = await userService.createLeave(id, body.type, body.category, days, body.date_start, body.date_end, body.reason);
    if (leave.affectedRows) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.RECORD_SUCCESSFULY_UPDATED));
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_ERROR));
    }
  } catch (error) {
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.getUserLeaves = async (req, res) => {
  try {
    const id = req.params["id"];
    const leave = await userService.getLeaves(id);
    if (leave?.length) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.SUCCESS, leave));
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_ERROR));
    }
  } catch (error) {
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.approveAttendance = async (req, res) => {
  const httpRequest = adapterRequest(req);
  try {
    const { body } = httpRequest;

    const approved = await userService.approveUserAttendance(body.id, body.actiontype);
    if (approved) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.SUCCESS));
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_ERROR));
    }
  } catch (error) {
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.approveLeave = async (req, res) => {
  const httpRequest = adapterRequest(req);

  try {
    const { body } = httpRequest;

    const approved = await userService.approveUserLeave(body.id, body.actiontype);
    if (approved) {
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.SUCCESS));
    }
    else {
      return res.status(HttpCodes.BAD_REQUEST).send(new SuccessResponse(AppMessages.APP_ERROR));
    }
  } catch (error) {
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

exports.managersUsers = async (req, res) => {
  try {
    const id = req.params["id"];
    //Api Call and Compose Response Response
    let users = await userService.getUserUManger(id);
      return res.status(HttpCodes.OK).send(new SuccessResponse(AppMessages.SUCCESS, users));
  
  } catch (error) {
    //Compose Error Response
    return res.status(HttpCodes.INTERNAL_SERVER_ERROR).send(new ErrorResponse(AppMessages.INTERNAL_SERVER_ERROR));
  }
};

/////////////////////////////////////////////////////////////////////////////////////////////

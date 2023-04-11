const SuccessResponse = require("../composer/success-response");
const HttpCodes = require("../constants/httpCodes");

exports.dbErrorsMessage = (res,error) =>{
    if (error?.code == "ER_DUP_ENTRY") {
        return res.status(HttpCodes.UN_PROCESSABLR_ENTITY).send(new SuccessResponse(`Record with entry ${error.sqlMessage.split(" ")[2]} is already Exists`));
      }
      if(error.code == "ER_TRUNCATED_WRONG_VALUE"){
        return res.status(HttpCodes.UN_PROCESSABLR_ENTITY).send(new SuccessResponse(`Incorrect ${error.sqlMessage.split(" ")[3]} value`));
      }
}
const HttpCodes = require("../constants/httpCodes");
const AppMessages = require("../constants/appMessages");
const ErrorResponse =  require("../composer/error-response");

function admin(req, res, next) {

   if(!req.user.role && req.user.role !== 'admin'){
      return res.status(HttpCodes.FORBIDDEN).send(new ErrorResponse(AppMessages.APP_ACCESS_DENIED));
   }

   next();

}


module.exports = admin;


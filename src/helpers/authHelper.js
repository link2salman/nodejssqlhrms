const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.encryptString = async (sourceString) => {
  const salt = await bcrypt.genSalt(10);
  let encryptedString = await bcrypt.hash(sourceString, salt);
  return encryptedString;
};

exports.generateOTP = async () => {
  const otp = Math.floor(1000 + Math.random() * 9000);
  return otp;
};

// exports.generateAuthToken = async (baseField) => {
//   const token = jwt.sign({ _id: baseField }, process.env.jwtPrivateKey, { expiresIn: '1d' });
//   return token;
// };

exports.generateAuthTokenWithObject = async (data) => {
  const token = jwt.sign(
    {
      employee_id: data.id,
      role: data.role,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
    },
    process.env.NODE_SECRET_KEY,
    { expiresIn: '1d' }
  ); //'node_secureJwtKey') // config.get('jwtPrivateKey'));
  return token;
};
exports.addAuthTokenInResponseHeader = async (data, resObject) => {
  let token = await this.generateAuthTokenWithObject(data);
  data.token = token;
  // resObject.header("x-auth-token", token);
  return { resObject, data };
};

exports.isValidUser = async (
  requestPassword,
  encryptedPassword,
  responseObject
) => {

  let isValidPassword = await bcrypt.compare(
    requestPassword,
    encryptedPassword
  );
  return isValidPassword;
};

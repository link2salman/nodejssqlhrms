let BadRequest = class BadRequest{
    constructor(errorMessage) {
      this.status = false;
      this.errMsg = errorMessage;
      this.result = null;
    }
  
    getError() {
      return {
        status:this.status,
        message: this.message,
        result: this.result,
      };
    }
  };
  
  module.exports = BadRequest;
  

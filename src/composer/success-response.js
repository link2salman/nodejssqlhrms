let SuccessResponse = class SuccessResponse{

    constructor(message,result) {
      this.status= true
      this.message = message;
      this.result =result; 
    }
  
    getSuccess() {
      return {
         status:this.status,
         message: this.message,
         result: this.result,
      };
    }
  };
  
  module.exports = SuccessResponse;
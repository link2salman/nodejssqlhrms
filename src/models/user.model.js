const mongoose = require("mongoose");

const { Schema } = mongoose;
/* =============================================================================
 User Schema
============================================================================= */
const UserSchema = new Schema({
  first_name: {
    type: Schema.Types.String,
    required: true,
  },
  last_name: {
    type: Schema.Types.String,
    required: true,
  },
  display_name: {
    type: Schema.Types.String,
    required: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
  },
  email: {
    type: Schema.Types.String,
    required: true,
  },
  role: {
    type: Schema.Types.String,
    required: true,
  },
  company_id: {
    type: Schema.Types.String,
    required: true,
  },
});

/* =============================================================================
   User Modal
  ============================================================================= */
const User = mongoose.model("User", UserSchema);

module.exports = User;

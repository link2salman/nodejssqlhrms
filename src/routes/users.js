const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const userValidator = require("../validators/userValidator");

const router = express.Router();
const usersController = require("../controllers/usersController");

router.post(
  "/create",
  [auth, userValidator.validateCreateUser],
  usersController.createUser
);

router.get("/roles", [auth], usersController.getUserRoles);
router.get("/departments", [auth], usersController.getUserDepartments);
router.get("/managers", [auth], usersController.getUserManagers);
router.get("/list", [auth], usersController.usersList);
router.get("/:id", [auth], usersController.getUser);
router.delete("/:id", [auth], usersController.deleteUser);
router.put("/update/:id", [auth, userValidator.validateUpdateUser], usersController.updateUser);
router.post("/mark_attendance/:id", [auth, userValidator.validateUserAttendance], usersController.markAttendance);
router.get("/attendance/:id", [auth], usersController.getUserAttendance);
router.post("/leave/:id", [auth, userValidator.validateLeaveRecord], usersController.applyLeave);
router.get("/leaves/:id", [auth], usersController.getUserLeaves);
router.get("/users/leaves/:id", [auth], usersController.getUserLeaves);
router.post("/approve/attendance", [auth, userValidator.validateApproveAttendance], usersController.approveAttendance);
router.post("/approve/leave", [auth, userValidator.validateApproveLeaved], usersController.approveLeave);
router.get("/manager/users/:id", [auth], usersController.managersUsers);

router.post(
  "/change_password",
  [auth, userValidator.validateChangePassword],
  usersController.changeUserPassword
);

router.post("/login", userValidator.validateUserLogin, usersController.login);

module.exports = router;

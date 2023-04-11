const mysql = require("../../config/mysql");
const { weekends } = require("../../constants/constants");
const { resendOTP } = require("../../controllers/usersController");
const { localformatDate, getTodayDateLocalFormat, getTodayDateStandardFormat } = require("../../helpers/helper");

exports.createUserAccount = async (first_name, last_name, email, contact, role, joining_date, reporting_to, cnic, department, address, password) => {
  let sql = `INSERT INTO employees(first_name,	last_name,	email,	contact,	role,	joining_date,	reporting_to,	cnic,	department,	address, password)  
                      values( ?,	?,	?,	?,	?,	?,	?,	?,	?, ?, ?) `;
  try {
    let resp = await mysql.query(sql, [first_name, last_name, email, contact, role, joining_date, reporting_to, cnic, department, address, password]);
    return resp
  } catch (error) {
    return error
  }
}

exports.updateUserAccount = async (id, first_name, last_name, contact, cnic, address, profilepic) => {
  let sql = ` UPDATE employees set first_name = "${first_name}", last_name ="${last_name}", contact="${contact}", cnic="${cnic}", address="${address}", profilepic="${profilepic}"  where employee_id = "${id}" `;
  let sql1 = `SELECT  employee_id, first_name,	last_name,	email,	contact,	role, joining_date,	reporting_to,	cnic,	department,	address, profilepic 
  FROM  employees where employee_id = "${id}"`;
  try {
    let resp = await mysql.query(sql);
    if (resp?.length) {
      let resp1 = await mysql.query(sql1);
      return resp1[0] ? resp1[0] : null;
    }
    return resp[0][0] ? resp[0][0] : null;
  } catch (error) {
  }
};

exports.getUsers = async () => {
  let users_query = `SELECT employee_id, first_name,	last_name,	email,	contact,	DATE_FORMAT(joining_date,'%d-%m-%Y') AS 'joining_date',	reporting_to,	cnic,	address, profilepic, _role, _department FROM employees emp inner join departments dept on emp.department = dept.department_id inner join roles rl on emp.role = rl.role_id where emp.role != "1"`;
  // WHERE  is_active = 1`;
  try {
    let resp = await mysql.query(users_query);
    return resp

  } catch (error) {
    return error
  }

};

exports.updateUserPassword = async (userId, password) => {
  let sql = `UPDATE employees SET password = '${password}' WHERE id=${userId}`;
  let resp = await mysql.query(sql);

  resp = resp[0];
};

exports.deleteUser = async (userId) => {
  // let sql = `UPDATE users SET  is_active=0 where id=${userId}`;
  let sql = `DELETE FROM employees where employee_id=${userId}`;

  try {
    let resp = await mysql.query(sql);
    return resp[0]
  } catch (error) {
    return error
  }


};

exports.login = async (email, password) => {
  //* --------------  QUERY EXISTING USER ----------------------------------------- */
  let user = await this.getUser(email, password);
  return user;
};

exports.getUserByEmail = async (email) => {
  let sql = `SELECT employee_id, first_name,	last_name,	email,	contact,	DATE_FORMAT(joining_date,'%d-%m-%Y') AS 'joining_date',	reporting_to,	cnic,	address, password, profilepic, _role, _department FROM employees emp inner join departments dept on emp.department = dept.department_id inner join roles rl on emp.role = rl.role_id 
              WHERE emp.email = '${email}'`;
  try {
    let resp = await mysql.query(sql);
    return resp[0][0]
  } catch (error) {
    return error
  }
};

exports.getUser = async (email, password) => {
  let sql = `SELECT employee_id, first_name,	last_name,	email,	contact,	role,	DATE_FORMAT(joining_date,'%d-%m-%Y') AS 'joining_date',	reporting_to,	cnic,	department,	address, profilepic
               FROM employees 
              WHERE username = '${email}' and password='${password}'`;
  let resp = await mysql.query(sql);
  return resp ? resp[0][0] : null;
};

exports.getUserByID = async (id) => {
  let users_query = `SELECT employee_id, first_name,	last_name,	email,	contact,	DATE_FORMAT(joining_date,'%d-%m-%Y') AS 'joining_date',	reporting_to,	cnic,	address, profilepic, _role, _department FROM employees emp inner join departments dept on emp.department = dept.department_id inner join roles rl on emp.role = rl.role_id where emp.employee_id = '${id}'`;

  try {
    let resp = await mysql.query(users_query);
    return resp[0][0]
  } catch (error) {
  }

};

exports.getRoles = async () => {
  let sql = `SELECT role_id, _role FROM roles`;
  try {
    let resp = await mysql.query(sql);
    return resp[0]
  } catch (error) {
    return error
  }
};

exports.getDepartments = async () => {
  let sql = `SELECT department_id, _department FROM departments`;
  try {
    let resp = await mysql.query(sql);
    return resp[0].sort((a, b) => a.department_id - b.department_id)
  } catch (error) {
    return error
  }
};

exports.getAttendace = async (id) => {
  let sql = `SELECT attendance_id, daytype, DATE_FORMAT(date,'%d-%m-%Y') AS 'date', day, startTime, endTime, attendance_status FROM attendance where emp_id = '${id}'`;
  try {
    let resp = await mysql.query(sql);
    const localDateToday = getTodayDateLocalFormat()
    const standardDateToday = getTodayDateStandardFormat()
    const dayString = new Date(standardDateToday).toLocaleString('en-us', { weekday: 'long' })
    const isWeekend = weekends.includes(dayString)
    const isToday = resp[0]?.filter(db => db.date == `${localDateToday}`)
    if (isToday?.length) {
      return resp[0]
    }
    else {
      let sql = `INSERT INTO attendance(emp_id, daytype, date, day, startTime, endTime) values( ?,	?,	?, ?, ?, ?) `;
      let resp = await mysql.query(sql, [id, isWeekend ? "Weekend" : "Working Day", standardDateToday, dayString, null, null]);
      if (resp[0]) {
        let sql = `SELECT attendance_id, daytype, DATE_FORMAT(date,'%d-%m-%Y') AS 'date', day, startTime, endTime, attendance_status FROM attendance where emp_id = '${id}'`;
        let resp = await mysql.query(sql);
        return resp[0]
      }
    }
  } catch (error) {
    return error
  }
};

exports.checkAttendance = async (emp_id, date) => {
  let sql = `SELECT attendance_id, daytype, date, day, startTime, endTime FROM attendance where emp_id = '${emp_id}' AND date = '${date}'`;
  try {
    let resp = await mysql.query(sql);
    return resp[0][0]
  } catch (error) {
    return error
  }
};

exports.getUpdateAttendance = async (emp_id, id, date, day, startTime, endTime) => {
  let sql = `UPDATE attendance SET daytype='Working Day', date='${date}', day='${day}', startTime='${startTime}', endTime='${endTime}' where emp_id='${emp_id}' AND attendance_id='${id}' AND date='${date}'`;
  try {
    let resp = await mysql.query(sql);
    return resp[0]
  } catch (error) {
    return error
  }
};

exports.createAttendance = async (id, daytype, date, day, startTime, endTime) => {
  let sql = `INSERT INTO attendance(emp_id, daytype, date, day, startTime, endTime) values( ?,	?,	?, ?, ?, ?) `;
  try {
    let resp = await mysql.query(sql, [id, daytype, date, day, startTime ? startTime : null, endTime ? endTime : null]);
    return resp[0]
  } catch (error) {
    return error
  }
};

exports.getManagers = async (employee_id, day, date, time) => {
  let sql = `SELECT employee_id, first_name,	last_name,	email,	contact, DATE_FORMAT(joining_date,'%d-%m-%Y') AS 'joining_date'	,	reporting_to,	cnic,	address, profilepic, _role, _department FROM employees emp inner join departments dept on emp.department = dept.department_id inner join roles rl on emp.role = rl.role_id where emp.role = '2'`;
  try {
    let resp = await mysql.query(sql, [employee_id, day, date, time]);
    return resp[0]
  } catch (error) {
    return error
  }
};

exports.createLeave = async (leave_id, type, category, days, date_start, date_end, reason) => {
  let sql = `INSERT INTO employees.leave(leave_id, type, category, days, date_start, date_end, reason) values( ?,	?,	?, ?, ?, ?, ?) `;
  try {
    let resp = await mysql.query(sql, [Number(leave_id), type, category, days, date_start, date_end, reason]);
    return resp[0]
  } catch (error) {
    return error
  }
};

exports.getLeaves = async (id) => {
  let sql = `SELECT leave_id, type, category, days, DATE_FORMAT(date_start,'%d-%m-%Y') AS 'date_start', DATE_FORMAT(date_end,'%d-%m-%Y') AS 'date_end', reason, leave_table_id, leave_status from employees.leave where leave_id='${id}'`;
  try {
    let resp = await mysql.query(sql);
    return resp[0]
  } catch (error) {
    console.log(error)
    return error
  }
};

exports.approveUserAttendance = async (id, actionType) => {
  let sql = `UPDATE attendance SET attendance_status='${actionType}' where attendance_id='${id}'`;
  try {
    let resp = await mysql.query(sql);
    return resp[0]
  } catch (error) {
    console.log(error)
    return error
  }
};

exports.approveUserLeave = async (id, actionType) => {
  let sql = `UPDATE employees.leave SET leave_status='${actionType}' where leave_table_id='${id}'`;
  try {
    let resp = await mysql.query(sql);
    return resp[0]
  } catch (error) {
    console.log(error)
    return error
  }
};

exports.getUserUManger = async (id) => {
  let managerQuery = `SELECT employee_id, first_name,	last_name FROM employees where employees.employee_id = '${id}'`;

  try {
    let manager = await mysql.query(managerQuery);
    if (manager) {
      const { first_name, last_name } = manager[0][0]
      let users_query = `SELECT employee_id, first_name,	last_name,	email,	contact,	DATE_FORMAT(joining_date,'%d-%m-%Y') AS 'joining_date',	reporting_to,	cnic,	address, profilepic, _role, _department FROM employees emp inner join departments dept on emp.department = dept.department_id inner join roles rl on emp.role = rl.role_id where emp.role != "1" AND reporting_to='${first_name + " " + last_name}' `;
      let resp = await mysql.query(users_query);
      return resp[0]
    }

  } catch (error) {
    console.log(error)
    return error
  }

};
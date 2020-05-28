const mysql = require("mysql2/promise");
const cTable = require("console.table");
const inquirer = require("inquirer");

const main = async () => {
    try {
        const connection = await mysql.createConnection({
            host: "localhost",
            port: 3306,
            user: "root",
            password: "password",
            database: "employee_db"
        });
        console.log(`Connected to db with id ${connection.threadId}`)
        startPromptAnswer(connection);

    } catch (error) {
        console.log(error)
    };
};
function startPrompt() {
    return inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would like to do?",
            choices: ["View Departments", "View Roles", "View All Employee", "View Utilized Budget of Departments", "Add Department", "Add Role", "Add Employee", "Update Employee Role", "Exit"]
        }
    ])
};
async function startPromptAnswer(connection) {
    const answer = await startPrompt();
    switch (answer.action) {
        case "View Departments":
            await viewDepartment(connection);
            await startPromptAnswer(connection);
            break;
        case "View Roles":
            await viewRole(connection);
            await startPromptAnswer(connection);
            break;
        case "View All Employee":
            await viewAllEmployee(connection);
            await startPromptAnswer(connection);
            break;
        case "View Utilized Budget of Departments":
            await viewBudgetDep(connection);
            await startPromptAnswer(connection);
            break;
        case "Add Department":
            const returnDepartment = await addDepartmentPrompt(connection);
            await addDepartment(connection, returnDepartment);
            await startPromptAnswer(connection);
            break;
        case "Add Role":
            const returnRole = await addRolePrompt(connection);
            await addRole(connection, returnRole);
            await startPromptAnswer(connection);
            break;
        case "Add Employee":
            const returnEmployee = await addEmployeePrompt(connection);
            await addEmployee(connection, returnEmployee);
            await viewAllEmployee(connection);
            await startPromptAnswer(connection);
            break;
        case "Update Employee Role":
            const returnUpdateEmployeeRole = await updateEmployeeRolePrompt(connection);
            await updateEmployeeRole(connection, returnUpdateEmployeeRole);
            await viewAllEmployee(connection);
            await startPromptAnswer(connection);
            break;
        case "View Employees by Manager":
            const returnManager = await viewEmployeeByManagerPrompt(connection);
            await viewEmployeeByManager(connection, returnManager);
            await startPromptAnswer(connection);
            break;
        case "Exit":
            connection.end();
            break;
    }

};
const viewAllEmployee = async (connection) => {
    const sqlQuery = `SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, role.salary, department.name AS department, CONCAT(manager.first_name, " ", manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee AS manager ON employee.manager_id = manager.id`;
    const [rows, fields] = await connection.query(sqlQuery);
    console.table(rows);
}
const viewDepartment = async (connection) => {
    const [rows, fields] = await connection.query("SELECT * FROM department");
    console.table(rows)
    return rows;
};
const viewRole = async (connection) => {
    const [rows, fields] = await connection.query("SELECT role.id, role.title, role.salary, department.name FROM role INNER JOIN department on department_id = department.id");
    console.table(rows)
    return rows;
};
const viewEmployee = async (connection) => {
    const [rows, fields] = await connection.query("SELECT * FROM employee");
    console.table(rows)
    return rows;
};
async function viewManagerName(connection) {
    const [rows, fields] = await connection.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title AS role FROM employee LEFT JOIN role ON employee.role_id = role.id WHERE manager_id IS NULL`);
    console.table(rows);
    return rows;
};
async function viewEmployeeByManagerPrompt(connection) {
    const viewManagerList = await viewManagerName(connection);
    let managerList = viewManagerList.map((manager) => {
        return `${manager.id},${manager.first_name}, ${manager.role}`
    })
    return inquirer.prompt([
        {
            type: "list",
            name: "managerName",
            message: "View Employees with Manager",
            choices: managerList
        }
    ]);
};
const viewEmployeeByManager = async (connection, returnManager) => {
    const sqlQuery =
        "SELECT employee.id, employee.first_name, employee.last_name, role.title AS role FROM employee LEFT JOIN role ON employee.role_id = role.id WHERE manager_id = ?";
    const params = [parseInt(returnManager.managerName)];
    const [rows, fields] = await connection.query(sqlQuery, params)
    console.table(rows);
}
const viewBudgetDep = async (connection)=>{
    const sqlQuery = `SELECT department.id, department.name AS department, SUM(role.salary) AS total from role
    LEFT JOIN department on role.department_id = department.id GROUP BY department.id`
    const [rows, fields] = await connection.query(sqlQuery);
    console.table(rows);
}

async function addDepartmentPrompt() {
    return inquirer.prompt([
        {
            type: "input",
            name: "departmentName",
            message: "Enter new Department name."
        }
    ])
};
const addDepartment = async (connection, returnDepartment) => {
    const sqlQuery = "INSERT INTO department (name) VALUES (?)";
    const params = [returnDepartment.departmentName]
    const [rows, fields] = await connection.query(sqlQuery, params);
};
async function addRolePrompt(connection) {
    const viewDepartmentList = await viewDepartment(connection);
    let departmentListId = viewDepartmentList.map((department) => {
        return `${department.id}, ${department.name}`;
    })
    return inquirer.prompt([
        {
            type: "input",
            name: "roleTitle",
            message: "Enter title",
        }, {
            type: "input",
            name: "salaryWage",
            message: "Enter Salary"
        }, {
            type: "list",
            name: "departmentId",
            message: "Select Department",
            choices: departmentListId
        }
    ])
};
const addRole = async (connection, returnRole) => {
    try {
        const sqlQuery = "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)"
        const params = [returnRole.roleTitle, parseFloat(returnRole.salaryWage).toFixed(2), parseInt(returnRole.departmentId)];
        const [rows, fields] = await connection.query(sqlQuery, params);
    } catch (error) {
        console.log(`add role error`, error)
    }
};
async function addEmployeePrompt(connection) {
    const viewRoleList = await viewRole(connection);
    let roleList = viewRoleList.map((role) => {
        return `${role.id},${role.title}`;
    });
    const viewManagerList = await viewManagerName(connection);
    let managerList = viewManagerList.map((manager) => {
        return `${manager.id},${manager.first_name}, ${manager.role}`
    });
    managerList.push("null");
    return inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "What is employee's first name?",
        }, {
            type: "input",
            name: "lastName",
            message: "What is employee's last name?",
        }, {
            type: "list",
            name: "employeeRoleId",
            message: "What is employee's role?",
            choices: roleList
        }
        , {
            type: "list",
            name: "managerId",
            message: "Who is employee's manager?",
            choices: managerList
        }
    ]);
}
const addEmployee = async (connection, returnEmployee) => {
    try {
        const sqlQuery = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)";
        let managerId;
        if (returnEmployee.managerId === 'null') {
            managerId = null;
        } else {
            managerId = parseInt(returnEmployee.managerId.split(",")[0]);
        };
        const params = [returnEmployee.firstName, returnEmployee.lastName, returnEmployee.employeeRoleId.split(",")[0], managerId]
        const [rows, fields] = await connection.query(sqlQuery, params);
    } catch (error) {
        console.log(`add employee error`, error)
    }
};

async function updateEmployeeRolePrompt(connection) {
    const viewEmployeeList = await viewEmployee(connection);
    let employeeList = viewEmployeeList.map((employee) => {
        return `${employee.id},${employee.first_name},${employee.last_name}`
    });
    const viewRoleList = await viewRole(connection);
    let roleList = viewRoleList.map((role) => {
        return `${role.id},${role.title}`;
    });
    return inquirer.prompt([
        {
            type: "list",
            name: "updateEmployee",
            message: "Please choose employee to update role",
            choices: employeeList
        }, {
            type: "list",
            name: "updateRoleList",
            message: "Please select employee's role.",
            choices: roleList
        }
    ]);
}
const updateEmployeeRole = async (connection, returnUpdateEmployeeRole) => {
    const sqlQuery = "UPDATE employee SET role_id = ? WHERE id = ?"
    const params = [parseInt(returnUpdateEmployeeRole.updateRoleList.split(",")[0]), parseInt(returnUpdateEmployeeRole.updateEmployee.split(",")[0])]
    const [rows] = await connection.query(sqlQuery, params);
};


main();
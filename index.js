const inquirer = require("inquirer");
require('dotenv').config();
// const mysql = require('mysql');
const mysql = require("mysql2");
const consoleTable = require("console.table");
const figlet = require('figlet');
const { allowedNodeEnvironmentFlags, title } = require('process');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "rootroot",
    // database: employee_database
});

connection.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
    // console.log("Employee Tracker", function(err, data) {
    //     if (err) {
    //         console.log("figlet not loading");
    //     } else {
    //         console.log(data);
    //     }
        startTracker();
    });

function startTracker() {
    const firstQuestion = [{
        type: "list",
        name: "action",
        message: "What would you like to do?",
        loop: false,
        choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role"]
    }]

    inquirer.prompts(firstQuestion) 
    .then(response => {
        switch (response.action) {
            case "View all departments":
                viewAll("DEPARTMENT");
                break;
            case "View all roles":
                viewAll("ROLE");
                break;
            case "View all employees":
                viewAll("EMPLOYEE");
                break;
            case "Add a department":
                addDepartment();
                break;
            case "Add a role":
                addRoll();
                break;
            case "Add an employee":
                addEmployee();
                break;
            case "Update an employee role":
                updateRole();
                break;
                default:
                    connection.end();
        }
    })
    .catch(err => {
        console.log(err);
    });
};


const viewAll = (table) => {
    var query;
    if (table === "DEPARTMENT") {
        query = `SELECT * FROM DEPARTMENT`;
    } else if (table === "ROLE") {
        query = `SELECT R.id AS id, title, salary, D.name AS department
        FROM ROLE AS R LEFT JOIN DEPARTMENT AS D
        ON R.department_id = D.id;`;
    } else {
        query = `SELECT E.id AS id, E.first_name AS first_name, E.last_name AS last_name, 
        R.title AS role, D.name AS department, CONCAT(M.first_name, " ", M.last_name) AS manager
        FROM EMPLOYEE AS E LEFT JOIN ROLE AS R ON E.role_id = R.id
        LEFT JOIN DEPARTMENT AS D ON R.department_id = D.id
        LEFT JOIN EMPLOYEE AS M ON E.manager_id = M.id;`;
    }
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);

        startTracker();
    });
};

function addDepartment() {
    let questions = [{
        type: "input",
        name: "name",
        message: "What is the name of your new department?"
    }];

    inquirer.prompt(questions)
    .then(response => {
        const query = `INSERT INTO department (name) VALUES (?)`;
        connection.query(query, [response.name], (err, res) => {
            if (err) throw err;
            console.log(`New Department: ${response.name} has been created.` );
            startTracker();
        });
    })
    .catch(err => {
        console.log(err)
    });
};

function addRoll() {
    const departments = [];
    connection.query(`SELECT * FROM DEPARTMENT`, (err, res) => {
        if (err) throw err;
        res.forEach(dep => {
            let questionObject = {
                name: dep.name,
                value: dep.id
            }
            departments.push(questionObject);
        });

        let questions = [
        {
            type: "input",
            name: "title",
            message: "What is the title of the new role you are creating?"
        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary of the new role?"
        },
        {
            type: "list",
            name: "department",
            choices: departments,
            message: "Which department was this role created for?"
        }
    ];

    inquirer.prompt(questions)
    .then(response => {
        const query = `INSERT INTO ROLE (title, salary, department_id) VALUES (?)`;
        connection.query(query, [[response.title, response.salary, response.department]], (err, res) => {
            if (err) throw err;
            console.log(`New Role: ${response.title} has been added to roles.`);
            startTracker();
        });
    })
    .catch(err => {
        console.log(err);
    });
    });
}

function addEmployee() {
    connection.query(`SELECT * FROM EMPLOYEE`, (err, employeeRes) => {
        if (err) throw err;
        const employeeChoice = [{
            name: 'None',
            value: 0
        }];
        employeeRes.forEach(({ first_name, last_name, id }) => {
            employeeChoice.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        connection.query(`SELECT * FROM ROLE`, (err, roleRes) => {
            if(err) throw err;
            const roleChoice = [];
            roleRes.forEach(({ title, id }) => {
                roleChoice.push({
                    name: title,
                    value: id
                });
            });

            let questions = [
            {
                type: "input",
                name: "first_name",
                message: "What is the employee's first name?"
            },
            {
                type: "input",
                name: "last_name",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "role_id",
                choices: roleChoice,
                message: "What is the employee's role?"
            },
            {
                type: "list",
                name: "manager_id",
                choices: employeeChoice,
                message: "Who is this employee's manager?"
            }
            ];

            inquirer.prompt(questions)
            .then(response => {
                const query = `INSERT INTO EMPLOYEE (first_name, last_name, role_id, manager_id) VALUES (?)`;
                let manager_id = response.manager_id !== 0? response.manager_id: null;
                connection.query(query, [[response.first_name, response.last_name, response.role_id, manager_id]], (err, res) => {
                    if (err) throw err;
                    console.log(`Added employee: ${response.first_name} ${response.last_name}.`);
                    startTracker();
                });
            })
            .catch(err => {
                console.log(err);
            });
        });
    });
};

function updateRole() {
    connection.query(`SELECT * FROM EMPLOYEE`, (err, employeeRes) => {
        if (err) throw err;
        const employeeChoice = [];
        employeeRes.forEach(({ first_name, last_name, id}) => {
            employeeChoice.push({
                name: first_name + " " + last_name,
                value: id
            });
        });

        connection.query(`SELECT * FROM ROLE`, (err, roleRes) => {
            if (err) throw err;
            const roleChoice = [];
            roleRes.forEach(({ title_id }) => {
                roleChoice.push({
                    name: title,
                    value: id
                });
            });

            let questions = [
                {
                    type: "list",
                    name: "id",
                    choices: employeeChoice,
                    message: "Which employee's role do you want to update?"
                },
                {
                    type: "list",
                    name: "role_id",
                    choices: roleChoice,
                    message: "What is this employee's new role?"
                }
            ];

            inquirer.prompt(questions)
            .then(response => {
                const query = `UPDATE EMPLOYEE SET ? WHERE ?? = ?;`;
                connection.query(query, [
                    { role_id: response.role_id},
                    "id",
                    response.id
                ], (err, res) => {
                    if (err) throw err;
                    console.log("The employee's role has been updated.");
                    startTracker();
                });
            })
            .catch(err => {
                console.log(err);
            });
        });
    });
};


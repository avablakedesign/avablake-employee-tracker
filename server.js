const dotenv = require("dotenv");
dotenv.config()
const mySql = require("mysql2/promise");
const inquirer = require("inquirer");
const consoleDotTable = require("console.table");

let connection = null;

async function main() {
    while (true) {
        const answers = await inquirer.prompt([
            {
                type : "list",
                name: "option",
                message: "Choose from the following",
                choices:[
                    {value:"view all departments", key:"view_department"}, 
                    {value:"view all roles", key: "view_roles"}, 
                    {value:"view all employees", key:"view_employees"},
                    {value:"add a department", key:"add_department"}, 
                    {value:"add a role", key:"add_role"}, 
                    {value:"add an employee", key:"add_employee"}, 
                    {value:"update an employee role", key:"update_employee_role"}
                ]
            },
            {
                type:"input",
                name:"new_department_name",
                message: "What is your department name?",
                when: (answers) => answers.option === "add a department"
            },
            {
                type:"input",
                name:"new_role_title",
                message: "What is the title?",
                when: (answers) => answers.option === "add a role"
            },
            {
                type:"input",
                name:"new_role_salary",
                message: "What is the salary?",
                when: (answers) => answers.option === "add a role"
            },
            {
                type:"list",
                name:"new_role_department",
                message: "What is the department name?",
                choices: async function(){
                    const [rows] = await connection.execute("SELECT name FROM department");
                    return rows.map(function(department){
                        return {key: department.name, value: department.name}
                    })
                },
                when: (answers) => answers.option === "add a role"
            },
            {
                type:"input",
                name:"new_employee_first_name",
                message: "What is your first name?",
                when: (answers) => answers.option === "add an employee"
            },
            {
                type:"input",
                name: "new_employee_last_name",
                message: "What is your last name?",
                when: (answers) => answers.option === "add an employee"
            },
            {
                type:"list",
                name: "new_employee_job_title",
                message: "What is your job title?",
                choices: async function(){
                    const [rows] = await connection.execute("SELECT title FROM role");
                    return rows.map(function(role){
                        return {key: role.title, value: role.title}
                    })
                },
                when: (answers) => answers.option === "add an employee"
            },
            {
                type:"list",
                name:"new_employee_manager",
                message: "What is the manager's name?",
                choices: async function(){
                    const [rows] = await connection.execute(`SELECT first_name FROM employee
                    INNER JOIN role
                    ON role.id = employee.role_id 
                    WHERE role.title = "Manager"
                    `)
                    if (rows.length > 0) {
                        const options = rows.map(function(manager) {
                            return {key: manager.first_name, value: manager.first_name}
                        })
                        options.push({key:"none", value:"none"})
                        return options
                    } else {
                        return [{key:"none", value:"none"}]
                    } 
                },
                when: (answers) => answers.option === "add an employee"
            },
            {
                type:"list",
                name: "update_employee_name",
                message: "Which employee would you like to update?",
                choices: async function(){
                    const [rows] = await connection.execute(`SELECT first_name FROM employee`)
                    return rows.map(function(employee){
                        return {key: employee.first_name, value: employee.first_name}
                    })
                },
                when: (answers) => answers.option === "update an employee role"
            },
            {
                type:"list",
                name: "update_employee_role",
                message: "What is the new job title?",
                choices: async function(){
                    const [rows] = await connection.execute("SELECT title FROM role");
                    return rows.map(function(role){
                        return {key: role.title, value: role.title}
                    })
                },
                when: (answers) => answers.option === "update an employee role"
            },
        ])
        switch(answers.option) {
            case "view all departments":{
                const [rows] = await connection.execute("SELECT * FROM department")
                console.table(rows)
            break;
            }
            case "add a department":{
                await connection.execute(`
                INSERT INTO department (name)
                VALUES ("${answers.new_department_name}");
                `)
            console.log("added new department to database")    
            break;
            }
            case "view all employees":{
                const [rows] = await connection.execute("SELECT * FROM employee")
                console.table(rows)
            break;    
            }
            case "view all roles":{
                const [rows] = await connection.execute("SELECT * FROM role")
                console.table(rows)
            break;    
            }
            case "add a role":{
                if (isNaN(parseFloat(answers.new_role_salary))) {
                    console.log("Salary must be a number, try again.")
                }
                else {
                    await connection.execute(`
                    INSERT INTO role (title, salary, department_id)
                    VALUES ("${answers.new_role_title}", ${parseFloat(answers.new_role_salary)}, (SELECT id FROM department WHERE name = "${answers.new_role_department}"))
                    `)
                    console.log("added new role to database");
                }
            break;
            }
            case "add an employee":{
                let manager = null;
                if (answers.new_employee_manager !== "none"){
                    const [db_manager] = await connection.execute(`SELECT id FROM employee WHERE first_name = "${answers.new_employee_manager}"`);
                    manager = db_manager[0].id
                }   
                await connection.execute(`
                INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ("${answers.new_employee_first_name}", "${answers.new_employee_last_name}", (Select id FROM role WHERE title = "${answers.new_employee_job_title}"), ${manager})`)
                console.log("added new employee to the database");
            }
            case "update an employee role":{
                await connection.execute(`
                UPDATE employee 
                SET role_id = (SELECT id FROM role WHERE title = "${answers.update_employee_role}")
                WHERE first_name = "${answers.update_employee_name}"
                `)
                console.log("updated employee role");
            }
        }    
    }
}
async function db_Connection(){
    connection = await mySql.createConnection(
        {
         host: process.env.MY_SQL_HOST,
         user: process.env.MY_SQL_USERNAME,
         password: process.env.MY_SQL_PASSWORD,
         database: process.env.MY_SQL_DATABASE
        })
        await main()
}
db_Connection()
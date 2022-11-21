const dotenv = require("dotenv");
dotenv.config()
const mySql = require("mysql2/promise");
const inquirer = require("inquirer");
const consoleDotTable = require("console.table");

let connection = null;

async function main() {
    console.log("running main");
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
                    const [rows] = await connection.execute("SELECT first_name FROM employee")
                },
                when: (answers) => answers.option === "add an employee"
            },
            {
                type:"input",
                name: "update_employee_role",
                message: "What is the new job title?",
                when: (answers) => answers.option === "update an employee role"
            },
        ])
        console.log(answers);
        switch(answers.option) {
            case "view all departments":{
                const [rows] = await connection.execute("SELECT * FROM department")
                console.table(rows)
                console.log(rows)
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
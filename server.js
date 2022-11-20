const dotenv = require("dotenv");
dotenv.config()
const mySql = require("mysql2/promise");
const inquirer = require("inquirer");
const consoleDotTable = require("console.table");

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
                type:"input",
                name:"new_role_department",
                message: "What is the department name?",
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
                type:"input",
                name: "new_employee_job_title",
                message: "What is your job title?",
                when: (answers) => answers.option === "add an employee"
            },
            {
                type:"input",
                name:"new_employee_manager",
                message: "What is the manager's name?",
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

            }
        }    
    }
}
async function db_Connection(){
    const connection = await mySql.createConnection(
        {
         host: process.env.MY_SQL_HOST,
         user: process.env.MY_SQL_USERNAME,
         password: process.env.MY_SQL_PASSWORD,
         database: process.env.MY_SQL_DATABASE
        })
        await main()
}
db_Connection()
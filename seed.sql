USE employee_db;
INSERT INTO department (name)
VALUES ("Sales"), ("Engineering"), ("Finance"), ("Legal");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1), 
       ("Salesperson", 80000, 1), 
       ("Lead Engineer", 150000, 2), 
       ("Software Engineer", 120000,2),
       ("Accountant", 125000, 3),
       ("Legal Team Lead", 250000, 4), 
       ("Lawyer", 190000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ("Tom", "White", 3, null),
       ("Bill", "Nye", 2, null), 
	("Sarah", "Allen", 8, 7),
       ("John", "Brown", 7, null), 
       ("Ashley", "Ramirez", 4, 2),
       ("Luke", "Cohen", 5, 6), 
       ("Rick", "Smith", 4, 2);

SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;


DROP TABLE department;
DROP TABLE role;
DROP TABLE employee;
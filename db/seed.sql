INSERT INTO department (name)
VALUES ("engineering"),
("finance"),
("legal"),
("sales");


INSERT INTO role (title, salary, department_id)
VALUES ("sales lead", 100000, 1),
("software engineer", 120000, 2),
("lead engineer", 150000, 2),
("accountant", 110000, 3),
("lawyer", 180000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Philip", "Vincent", 1, 3),
("Cristiano", "Ronaldo", 2, 1),
("Lionel", "Messi", 3, 1),
("Lil", "Uzi", 4, 3),
("NBA", "Youngboy", 5, 1),
("Mr.", "Beast", 2, 1),
("Segio", "Ramos", 4, 7),
("Cody", "Ko", 1, 2);




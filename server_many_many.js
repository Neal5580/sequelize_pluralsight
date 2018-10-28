const express = require("express");
const Sequelize = require("sequelize");
const _USERS = require("./users.json");
const Op = Sequelize.Op;

const app = express();
const port = 8001;

const connection = new Sequelize("test", "root", "syj789789", {
    host: "test.cbkd5dib2l9f.ap-southeast-2.rds.amazonaws.com",
    dialect: "mysql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});

const User = connection.define("User", {
    name: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: Sequelize.STRING,
        validate: {
            isAlphanumeric: true
        }
    }
});

const Post = connection.define("Post", {
    title: Sequelize.STRING,
    content: Sequelize.TEXT
});

const Comment = connection.define("Comment", {
    the_comment: Sequelize.STRING
});

const Project = connection.define("Project", {
    title: Sequelize.STRING
});

/**
 * Add workers into project
 */
app.put("/addWorker", (req, res) => {
    Project.findById(2)
        .then(project => {
            project.addWorkers(5);
        })
        .then(() => {
            res.send("User added");
        });
});

/**
 * Get User with projects data
 */
app.get("/getUserProjects", (req, res) => {
    User.findAll({
        attributes: ["name"],
        include: [
            {
                model: Project,
                as: "Tasks",
                attributes: ["title"]
            }
        ]
    })
        .then(output => {
            res.json(output);
        })
        .catch(error => {
            res.status(404).send(error);
        });
});

//Put foreignkey UserId in Post table
//And make Model Alias as User Ref
//So that we will receive user data which is named as "UserRef"
Post.belongsTo(User, {
    as: "UserRef",
    foreignKey: "userId"
});

//Create one to many relationship
//foreignkey = postid in comment table
Post.hasMany(Comment, {
    as: "All_Comments"
});

//Create many to many relationship
//Between project and user
//As a result, creates a UserProjects table with IDs for ProjectId and UserId
User.belongsToMany(Project, { as: "Tasks", through: "UserProjects" });
Project.belongsToMany(User, { as: "Workers", through: "UserProjects" });

connection
    .sync({
        force: true
    })
    .then(() => {
        User.bulkCreate(_USERS);
    })
    .then(() => {
        Post.create({
            userId: 1,
            title: "First post",
            content: "post content 1"
        });
    })
    .then(() => {
        Post.create({
            userId: 2,
            title: "Second post",
            content: "post content 2"
        });
    })
    .then(() => {
        Post.create({
            userId: 1,
            title: "Third post",
            content: "post content 3"
        });
    })
    .then(() => {
        Comment.create({
            PostId: 1,
            the_comment: "First post"
        });
    })
    .then(() => {
        Comment.create({
            PostId: 1,
            the_comment: "Second post"
        });
    })
    .then(() => {
        Project.create({
            title: "project 1"
        }).then(project => {
            project.setWorkers([4, 5]);
        });
    })
    .then(() => {
        Project.create({
            title: "project 2"
        });
    })
    .then(() => {
        console.log("Connection has been established successfully.");
    })
    .catch(err => {
        console.error("Unable to connect to the database:", err);
    });

app.listen(port, () => {
    console.log(`Example app listening on port ` + port);
});

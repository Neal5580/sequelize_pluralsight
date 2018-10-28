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
    operatorsAliases: false,
    define: {
        freezeTableName: true
    }
});

const User = connection.define(
    "User",
    {
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
    },
    {
        hooks: {
            beforeValidate: () => {
                console.log("beforeValidate");
            },
            afterValidate: () => {
                console.log("afterValidate");
            },
            beforeCreate: () => {
                console.log("beforeCreate");
            },
            afterCreate: () => {
                console.log("afterCreate");
            }
        }
    }
);

const Post = connection.define(
    "Post",
    {
        id: {
            primaryKey: true,
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4
        },
        title: Sequelize.STRING,
        content: Sequelize.TEXT
    },
    {
        hooks: {
            beforeValidate: () => {
                console.log("beforeValidate");
            },
            afterValidate: () => {
                console.log("afterValidate");
            },
            beforeCreate: () => {
                console.log("beforeCreate");
            },
            afterCreate: () => {
                console.log("afterCreate");
            }
        }
    }
);

/**
 * Get Posts with User data
 */
app.get("/allposts", (req, res) => {
    Post.findAll({
        include: [
            {
                model: User,
                as: "UserRef"
            }
        ]
    })
        .then(posts => {
            res.json(posts);
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
        console.log("Connection has been established successfully.");
    })
    .catch(err => {
        console.error("Unable to connect to the database:", err);
    });

app.listen(port, () => {
    console.log(`Example app listening on port ` + port);
});

/*
app.post("/post", (req, res) => {
    const newUser = req.body.user;
    User.create({
        name: newUser.name,
        email: newUser.email
    })
        .then(user => {
            res.json(user);
        })
        .catch(error => {
            console.log(error);
            res.status(404).send(error);
        });
});

app.get("/findallwhere", (req, res) => {
    User.findAll({
        where: {
            name: "Rachel"
        }
    })
        .then(user => {
            res.json(user);
        })
        .catch(error => {
            res.status(404).send(error);
        });
});

app.get("/findallwhereop", (req, res) => {
    User.findAll({
        where: {
            name: {
                [Op.like]: "Rach%"
            }
        }
    })
        .then(user => {
            res.json(user);
        })
        .catch(error => {
            res.status(404).send(error);
        });
});

app.get("/findbyid", (req, res) => {
    User.findById("55")
        .then(user => {
            res.json(user);
        })
        .catch(error => {
            res.status(404).send(error);
        });
});

app.put("/update", (req, res) => {
    User.update(
        {
            name: "Michale",
            password: "password"
        },
        { where: { id: 55 } }
    )
        .then(rows => {
            //Number of affected rows from response
            res.json(rows);
        })
        .catch(error => {
            res.status(404).send(error);
        });
});

app.delete("/remove", (req, res) => {
    User.destroy({
        where: {
            id: 50
        }
    })
        .then(() => {
            res.send("deleted");
        })
        .catch(error => {
            res.status(404).send(error);
        });
});
*/

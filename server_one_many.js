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

const Comment = connection.define(
    "Comment",
    {
        the_comment: Sequelize.STRING
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
 * Get Posts with User data and Comment data
 */
app.get("/allposts", (req, res) => {
    Post.findAll({
        include: [
            {
                model: User,
                as: "UserRef"
            },
            {
                model: Comment,
                as: "All_Comments"
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

/**
 * Get Single Post with Comment data
 */
app.get("/singlepost", (req, res) => {
    Post.findById("1", {
        include: [
            {
                model: User,
                as: "UserRef"
            },
            {
                model: Comment,
                as: "All_Comments",
                attributes: ["the_comment"]
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

//Create one to many relationship
//foreignkey = postid in comment table
Post.hasMany(Comment, {
    as: "All_Comments"
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
        console.log("Connection has been established successfully.");
    })
    .catch(err => {
        console.error("Unable to connect to the database:", err);
    });

app.listen(port, () => {
    console.log(`Example app listening on port ` + port);
});

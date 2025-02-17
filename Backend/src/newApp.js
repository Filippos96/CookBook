const express = require("express")
const { createPool } = require('mariadb');
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(express.json())
app.use(express.urlencoded())
const bcrypt = require('bcrypt');
const hashSalt = 10
const jwt = require('jsonwebtoken')

const ACCESS_TOKEN_SECRET = "alkfnalknfkalaas"

const ID_TOKEN_SECRET = "aljfnafnlanflanf"


const pool = createPool({
    host: "db",
    port: 3306,
    user: 'root',
    password: 'abc123',
    database: 'abc',
    connectionLimit: 10

})

pool.on('error',function(error){
    console.log("Error from pool", error)
})

app.use(function(request, response, next){
    
    response.set("access-Control-Allow-Origin", "*")
    response.set("access-Control-Allow-Methods", "*")
    response.set("access-Control-Allow-Headers", "*")
    response.set("access-Control-Expose-Headers", "*")

    next()

})

app.get("/recipes", async function(request, response){
    setTimeout(async function(){
        try {
            const query = "SELECT * FROM recipes ORDER BY title"
            const recipes = await pool.query(query)
            response.status(200).json(recipes)
        } catch (error){
            console.log(error)
            response.status(500).end()
        }
        
    }, 1000)
})

app.get("/recipes/:id", async function(request, response){
    setTimeout(async function(){
        try {
            const recipeId = request.params.id // retrieve the recipe ID from the request parameters
            const query = "SELECT * FROM recipes WHERE id = ?"
            const recipe = await pool.query(query, [recipeId])   
            if(recipe){ 
                response.status(200).json(recipe) // send the retrieved data back in the response
            } else {
                response.status(404).end()
            }
        } catch(error) {
            console.log(error)
            response.status(500).end()
        }
    }, 1000)
})

app.get("/recipes/:id/user", async function(request, response){
    try {
        const userId = request.params.id
        console.log(userId)
        const query = "SELECT username FROM accounts WHERE id = ?"
        const [username] = await pool.query(query, [userId])
        console.log(username)
        console.log(username.username)
        response.status(200).json(username)
    } catch (error){
        console.log(error)
        response.status(500).end()
    }
})

app.get("/recipes/:id/comments", async function(request, response){
    console.log("get request")
    try{
        
        const recipeId = request.params.id
        const query = "SELECT * FROM comments WHERE recipeId = ?"
        const comments = await pool.query(query, [recipeId])
        console.log(comments)
        response.status(200).json(comments)
    }
    catch(error){
        console.log(error)
        response.status(500).end()
    }
})

//need to edit this to get the userId
app.delete("/recipes/:id/:commentId", async function(request, response){
    try{

        const authorizationHeaderValue = request.get("Authorization")
        const accessToken = authorizationHeaderValue.substring(7)
        console.log(accessToken)

        jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async function(error, payload){
            if(error) {
                response.status(400)
            } else {

                const commentId = request.params.commentId
                const userQuery = "SELECT accountId FROM comments WHERE id = ?"
                const [user] = await pool.query(userQuery, [commentId])

                console.log(user.accountId)
                console.log(payload.sub)
                if(payload.sub === user.accountId){
                    console.log("Deleting")
                    const query = "DELETE FROM comments WHERE id = ?"
                    await pool.query(query, [commentId])
                    response.status(200).end()
                } else {
                    console.log(error);
                    response.status(500).end()
                }
            }
        })
    }
    catch(error){
        console.log(error);
        response.status(500).end()
    }
})

app.post("/recipes/:id/comments", async function(request, response){
    try{

        const authorizationHeaderValue = request.get("Authorization")
        const accessToken = authorizationHeaderValue.substring(7)

        jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async function(error, payload){
            if(error) {
                response.status(400)
            } else {
                const newComment = request.body
                const recipeId = request.params.id
                const accountId = payload.sub
                const query = "INSERT INTO comments (accountId, recipeId, comment) VALUES (?, ?, ?)"
                await pool.query(query, [accountId, recipeId, newComment.comment])
                response.status(201).end()
            }
        })
    }
    catch(error){
        console.log(error);
    }
})

app.delete("/comments/:id", async function(request, response){
    try{

        const authorizationHeaderValue = request.get("Authorization")
        const accessToken = authorizationHeaderValue.substring(7)

        jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async function(error, payload){
            if(error) {
                response.status(400)
            } else {
                const recipeId = request.params.id
                const commentId = request.params.commentId
                const query = "DELETE FROM comments WHERE id = ?"
                await pool.query(query, [commentId])
                response.status(200).end()
            }
        })
    }
    catch(error){
        console.log(error)
        response.status(500).end()
    }
})

app.post("/recipes", async function(request, response){
    try{

        const authorizationHeaderValue = request.get("Authorization")
        const accessToken = authorizationHeaderValue.substring(7)

        jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async function(error, payload){
            if(error) {
                response.status(400)
            } else {
                
                const newRecipe = request.body
                const accountId = payload.sub
                const query = "INSERT INTO recipes (accountId, title, ingredients, directives) VALUES (?, ?, ?, ?)"
                await pool.query(query, [accountId, newRecipe.title, newRecipe.ingredients, newRecipe.directives])
                response.status(201).end()
            }
        })
    }
    catch(error){
        console.log(error);
        response.status(500).end()
    }
})

app.delete("/recipes/:id", async function(request, response){
    try{

        const authorizationHeaderValue = request.get("Authorization")
        const accessToken = authorizationHeaderValue.substring(7)
        console.log(accessToken)

        jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async function(error, payload){
            if(error) {
                response.status(400)
            } else {
                const recipeId = request.params.id
                const userQuery = "SELECT accountId FROM recipes WHERE id = ?"
                const [user] = await pool.query(userQuery, [recipeId])

                if(payload.sub === user.accountId){
                    console.log("Deleting")
                    const query = "DELETE FROM recipes WHERE id = ?"
                    await pool.query(query, [recipeId])
                    response.status(200).end()
                } else {
                    console.log(error);
                    response.status(500).end()
                }
            }
        })
    }
    catch(error){
        console.log(error)
        response.status(500).end()
    }
})

app.put("/recipes/:id", async function(request, response){
    try{

        const authorizationHeaderValue = request.get("Authorization")
        const accessToken = authorizationHeaderValue.substring(7)
        

        jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async function(error, payload){
            if(error) {
                response.status(400)
            } else {
                const recipeId = request.params.id
                const userQuery = "SELECT accountId FROM recipes WHERE id = ?"
                const [user] = await pool.query(userQuery, [recipeId])

                if(payload.sub === user.accountId){
                    console.log("Updating")
                    const newRecipe = request.body
                    const query = "UPDATE recipes SET title = ?, ingredients = ?, directives = ? WHERE id = ?"
                    await pool.query(query , [newRecipe.title, newRecipe.ingredients, newRecipe.directives, recipeId])
                    response.status(200).end()
                } else {
                    console.log(error);
                    response.status(500).end()
                }
            }
        })
    }
    catch(error){
        console.log(error);
        response.status(500).end()
    }
})

app.post("/accounts", async function(request, response){
    try{
        const newAccount = request.body
        var errorCodes = []

        if(newAccount.username.length < 4){
            console.log("no characters")
            errorCodes.push("Username too short")
        }
        if(newAccount.username.length > 14){
            console.log("no characters")
            errorCodes.push("Username too long")
        }
        if(newAccount.password.length < 6){
            console.log("no characters")
            errorCodes.push("Password too short")
        }
        if(newAccount.password.length > 14){
            console.log("no characters")
            errorCodes.push("Password too long")
        }
        
        if (errorCodes.length > 0) {
            response.status(400).json(errorCodes)
            return
        }

        const checkQuery = "SELECT * FROM accounts WHERE username = ?"
        const [existingAccount] = await pool.query(checkQuery, [newAccount.username])

        if (existingAccount) {
            response.status(409).end()
        } else {
            bcrypt.hash(newAccount.password, hashSalt, async function(error, hashedPassword){
            if (error){
                console.log("There was an error hashing.")
                response.status(500).end()
            } else {
                console.log("INSERT")
                const query = "INSERT INTO accounts (username, password) VALUES (?, ?)"
                await pool.query(query, [newAccount.username, hashedPassword])
                response.status(201).end()
            }
        })  
        }
        
    }
    catch(error){
        console.log(error);
        response.status(500).end()
    }
})

app.post("/tokens", async function(request, response){
    console.log("We are in tokens")
    const grantType = request.body.grant_type
    const username = request.body.username
    const password = request.body.password

    if(grantType != "password"){
        console.log("Not a password")
        response.status(400).json({error: "unsupported_grant_type"})
        return
    }

    if(username.length === 0 || password.length === 0){
        console.log("no characters")
        response.status(400).json({error: "invalid_request"})
        return
    }

    try {
        console.log("Going in try")
        const query = "SELECT * FROM accounts WHERE username = ?"
        const [account] = await pool.query(query, [username])
        console.log(account)
        
        if (!account) {
            console.log("Invalid account")
            response.status(400).json({error: "invalid_grant"})
            return
        }

        bcrypt.compare(password, account.password, function(err, result) {
            if (err) {
                console.log("There was an error comparing passwords.")
                response.status(500).end()
            } else if (result) {
                console.log("Passwords match")
                const payload = {
                    sub: account.id
                }

                jwt.sign(payload, ID_TOKEN_SECRET, function(error, IDToken){
                    if (error) {
                        response.status(500).end()
                    } else {
                        jwt.sign(payload, ACCESS_TOKEN_SECRET, function(error, accessToken){
                            if(error) {
                                response.status(500).end()
                            } else {
                                console.log("200")
                                response.status(200).json({
                                    access_token: accessToken,
                                    id_token: IDToken,
                                    type: "bearer",
                                })
                            }
                        })
                    }
                })

            } else {
                console.log("Passwords do not match")
                response.status(400).json({error: "invalid_grant"})
            }
        })
        
    } catch(error) {
        console.log(error);
        response.status(500).end()
    }
})

app.get("/comments", async function(request, response){
    try {
        
        const query = "SELECT * FROM comments"
        const comments = await pool.query(query)
        response.status(200).json(comments)
    } catch(error) {
        console.log(error)
        response.status(500).json(comments)
    }
})

app.put("/comments/:id", async function(request, response){
    try{
        const newComment = request.body
        const commentId = request.params.id
        
        const query = "UPDATE comments SET comment = ? WHERE id = ?"
        await pool.query(query, [newComment.comment, commentId])
        response.status(201).end()
    }
    catch(error){
        console.log(error);
        response.status(500).end()
    }
})

app.get("/accounts", async function(request, response){
    try {
        
        const query = "SELECT * FROM accounts"
        const accounts = await pool.query(query)
        response.status(200).json(accounts) // send the retrieved data back in the response
    } catch(error) {
        console.log(error)
        response.status(500).end()
    }
})

app.get("/accounts/:id", async function(request, response){
    try{
        const accountId = request.params.id
        
        const query = "SELECT * FROM accounts WHERE id = ?"
        const account = await pool.query(query, [accountId])
        response.status(200).json(account)
    }
    catch(error){
        console.log(error);
        response.status(500).end()
    }
})

app.put("/accounts/:id", async function(request, response){
    try{
        const newAccount = request.body
        const accountId = request.params.id
        
        const query = "UPDATE accounts SET username = ?, password = ? WHERE id = ?"
        await pool.query(query, [newAccount.username, newAccount.password, accountId])
        response.status(201).end()
    }
    catch(error){
        console.log(error);
        response.status(500).end()
    }
})

app.delete("/accounts/:id", async function(request, response){
    try{
        
        const accountId = request.params.id
        const deleteCommentsQuery = "DELETE FROM comments WHERE accountId = ?"
        const deleteAccountQuery = "DELETE FROM accounts WHERE id = ?"
        await pool.query(deleteCommentsQuery, [accountId])
        await pool.query(deleteAccountQuery, [accountId])
        response.status(200).end()
    }
    catch(error){
        console.log(error)
        response.status(500).end()
    }
})

app.listen(8080)
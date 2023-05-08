const express = require("express")
const { pool } = require("./data/data")
const jwt = require("jsonwebtoken")

const app = express()

app.use(express.json())

app.listen(5000, () => {
    console.log("O servidor está ativo na porta 8080!");
})

const segredo = "MeuSegredo"

function verifyToken(request, response, next) {
    const token = request.headers.authorization

    if (!token) {
        response.status(401).json({message: 'Token não fornecido!'})
    }

    try {
        const decodificado = jwt.verify(token, segredo)
        request.user = decodificado
        next()
    } catch (error) {
        response.status(403).json({message: 'Token inválido'})
    }
}

app.get("/", (request, response) => {
    response.status(200).send("Olá mundo!")
})

app.get("/getUsuarios", async (request, response) => {
    try {
        const client = await pool.connect()
        const { rows } = await client.query("SELECT * FROM Usuarios")

        console.table(rows)
        response.status(200).send(rows)

    } catch (error) {
        console.error(error)
        response.status(500).send("Erro de conexão com o servidor")
    }
})

app.post("/createUsuarios", async (request, response) => {
    try {
        const { ID, Nome, Email, Senha }  = request.body
        pool.query(`INSERT INTO Usuarios (ID, Nome, Email, Senha) VALUES (${ID}, '${Nome}', '${Email}', '${Senha}')`)

        response.status(200).send("Usuário inserido com sucesso!")

    } catch (error) {
        console.error(error)
        response.status(500).send("Erro de conexão com o servidor")
    }
})

app.put("/updateUsuarios", async (request, response) => {
    try {
        const { ID, Nome, Email, Senha }  = request.body
        const { rows } = pool.query(`UPDATE Usuarios
            SET Nome = '${ Nome }',
            SET Email = '${ Email }',
            SET Senha = '${ Senha }'
            WHERE ID = ${ ID }`)

        response.status(200).send("Alteração executada com sucesso!")
        
    } catch (error) {
        console.error(error)
        response.status(500).send("Erro de conexão com o servidor")
    }
})
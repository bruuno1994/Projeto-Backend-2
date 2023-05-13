const express = require("express")
const { pool } = require("./data/data")
const jwt = require("jsonwebtoken")

const app = express()

app.use(express.json())

app.listen(5000, () => {
    console.log("O servidor está ativo na porta 5000!");
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

app.get("/users", async (request, response) => {
    try {
        const client = await pool.connect()
        const { rows } = await client.query(`SELECT * FROM Usuarios`)

        console.table(rows)
        response.status(200).send(rows)

    } catch (error) {
        console.error(error)
        response.status(500).send("Erro de conexão com o servidor")
    }
})

app.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    const client = await pool.connect();

    // Verificar se esse email existe
    const findUser = await client.query(`SELECT * FROM Usuarios where email='${email}'`);
    if (!findUser) {
        return res.status(401).json({ error: 'Usuario não existe' });
    }
    
    // Verificar se a senha esta correta.
    if ((findUser.rows[0].senha) !== senha) {
        return res.status(401).json({ error: 'Senha incorreta.' });
    }

    const { id, nome } = findUser.rows[0]
    return res.status(200).json({
        user: {
            id,
            nome,
            email
        },
        token : jwt.sign({id}, segredo),
    });
})

app.post("/users", async (request, response) => {
    try {
        const { nome, email, senha }  = request.body
        pool.query(`INSERT INTO Usuarios ( nome, email, senha) VALUES ('${nome}', '${email}', '${senha}')`)

        response.status(200).send("Usuário inserido com sucesso!")

    } catch (error) {
        console.error(error)
        response.status(500).send("Erro de conexão com o servidor")
    }
})

app.put("/users/:id", async (request, response) => {
    try {
        const { id } = request.params
        const { nome, email, senha } = request.body

        const client = await pool.connect()
        const atualizar = await client.query(`UPDATE Usuarios
            SET nome = '${ nome }', email = '${ email }', senha = '${ senha }'
            WHERE id = ${ id }`)

        response.status(200).send("Alteração executada com sucesso!")
        
    } catch (error) {
        console.error(error)
        response.status(500).send("Erro de conexão com o servidor")
    }
})

app.delete("/users/:id", async (request, response) => {
    try {

        const { id } = request.params 
        const res = await pool.query(`DELETE FROM Usuarios WHERE id = ${ id }`)
        console.log(res)
        response.status(200).send("Usuário deletado com sucesso!")
        
    } catch (error) {
        console.error(error)
        response.status(500).send("Erro de conexão com o servidor")
    }
})
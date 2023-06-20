import http from 'http'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { readFileCustom } from './helpers/read-helper.js'
import { writeFileCustom } from './helpers/write-helper.js'
import { sign, verify } from './helpers/jwt-helper.js'
import { url } from 'inspector'
import { write } from 'fs'

dotenv.config()


const server = http.createServer((req, res) => {
    const method = req.method
    const ContentType = {
        'Content-Type': 'application/json'
    }

    if (method === 'GET') {
        const marketId = req.url.split('/')[2]
        const markets = readFileCustom('markets.json')
        const branch = readFileCustom('branchs.json')
        const products = readFileCustom('products.json')
        const foundMarket = markets.find(e => e.id == marketId)
        // const branchmarket = branch.find(e => e.id == branchId)

        if (!foundMarket) {
            res.writeHead(404, ContentType)
            return res.end(JSON.stringify({
                message: 'Not found'
            }))
        }

        const marketProducts = products
            .filter(e => e.marketId == marketId)
            .filter(e => delete e.marketId)

        foundMarket.products = marketProducts

        res.writeHead(200, ContentType)
        res.end(JSON.stringify(foundMarket))
    }

    if (method === 'POST') {
        const url = req.url.split('/')[1]
       if(url === 'qoshish') {
        req.on('data', chunk => {
            const body = JSON.parse(chunk)
            const products = readFileCustom('products.json')

            products.push({
                id: products.at(-1)?.id + 1 || 1,
                ...body
            })

            writeFileCustom('products.json', products)
        })
        res.writeHead(200, ContentType)
        res.end(JSON.stringify({
            message: 'Ok'
        }))

       }
        if (url === 'sign-in') {
            req.on('data', chunk => {
                const { username, password } = JSON.parse(chunk)
                const users = readFileCustom('users.json').find(e => e.name === username && e.password === password)
                if (!users) {
                    res.writeHead(404, ContentType)
                    return res.end(JSON.stringify({
                        message: 'Unauthorized'
                    }))
                }
                res.writeHead(200, ContentType)
                res.end(JSON.stringify({
                    message: 'Authorized',
                    accesstoken: sign({ id: users.id, role: users.role })
                }))
                return
            })
            return
        }

        if (url === 'productla') {
            const accesstoken = req.headers["authorization"]
            const { role, id } = verify(accesstoken)
            const users = readFileCustom('users.json').find(e => e.id === id)

            if (!users) {
                res.writeHead(404, ContentType)
                return res.end(JSON.stringify({
                    message: 'Unauthorized'
                }))
            }

            if (role !== 'admin') {
                res.writeHead(401, ContentType)
                res.end(JSON.stringify({
                    message: 'topilmadi',
                }))
                return
            }
            req.on('data', chunk => {
                const { title } = JSON.parse(chunk)
                const nameProduct = readFileCustom('products.json')
                const market = readFileCustom('products.json').find(e => e.title === title)
                if (market) {
                    res.writeHead(409, ContentType)
                    res.end(JSON.stringify({
                        message: 'mavjud'
                    }))
                    return
                }
                accesstoken.push({
                    id: nameProduct.at(-1)?.id + 1 || 1,
                    title
                })
                writeFileCustom('products.json', nameProduct)
            })
        }
    }


    if (method === 'PATCH') {
        const productId = req.url.split('/')[2]
        const allProduct = readFileCustom('products.json')
        const fondProduct = allProduct.find(e => e.id == productId)

        if (!fondProduct) {
            res.writeHead(404)
            return res.end(JSON.stringify({
                message: 'Not found'
            }))
        }
        req.on('data', chunk => {
            const { title } = JSON.parse(chunk)
            fondProduct.title = title
            const index = allProduct.findIndex(e => e.id == productId)
            allProduct.splice(index, 1)
            allProduct.push(fondProduct)

            writeFileCustom('products.json', allProduct)
        })
        res.writeHead(200, ContentType)
        res.end(JSON.stringify({
            message: 'Ok'
        }))
    }
    if (method == 'DELETE') {
        const productId = req.url.split('/')[1]

        const allProduct = readfileCustom('products.json')

        const nameIndex = allProduct.findIndex(e => e.id == productId)
        allProduct.splice(nameIndex, 1)

       writeFileCustom('products.json', allProduct)

        res.end("Ok from main block")
    }
})
server.listen(9000, console.log('Listening...'))
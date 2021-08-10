//Blockchain
const express = require("express")
const crypto = require('crypto')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// Blockchain

class Blockchain {
    constructor() {
        this.chain = []
        this.createBlock(1, "0")
    }

    // Create new block
    createBlock = (proof, previous_hash) => {
        const block = {
            index: this.chain.length + 1,
            timestamp: new Date().toISOString(),
            proof,
            previous_hash,
        }
        this.chain.push(block)
        return block
    }

    // Generate proof of work for mining
    proofOfWork = (previous_proof) => {
        let new_proof = 1
        let check_proof = false

        while (!check_proof) {
            let hash_operation = crypto.createHash('sha256')
            hash_operation.update((new_proof**2 - previous_proof**2).toString())
            let hash = hash_operation.digest('hex')
            if(hash.slice(0, 4) === '0000') {
                check_proof = true
            } else {
                new_proof += 1
            }
            
        }
        return new_proof
    }

    // Verify if chain given has valid proofs
    isValidChain = (chain) => {
        if(chain.length === 0) {
            return true
        }

        let previous_block = chain[0]
        let current_index = 1
        while(current_index < chain.length) {
            let current_block = chain[current_index]

            if(current_block.previous_hash != this.hash(JSON.stringify(previous_block))) {
                return false
            }

            let prev_proof = previous_block.proof
            let proof = current_block.proof
            let hash_operation = crypto.createHash('sha256')
            hash_operation.update((proof**2 - prev_proof**2).toString())
            let hash = hash_operation.digest('hex')

            if(hash.slice(0, 4) !== '0000') {
                return false
            }
            previous_block = current_block
            current_index += 1
        }

        return true
    }

    /* Utility Functions */
    getPreviousBlock = () => this.chain[this.chain.length - 1]

    hashPreviousBlock = () => {
        let hash_operation = crypto.createHash('sha256').update(JSON.stringify(this.getPreviousBlock())).digest('hex')
        return hash_operation
    }

    hash = (s) => crypto.createHash('sha256').update(s).digest('hex')
}

// Create blockchain
const blockchain = new Blockchain()

// Mining blocks endpoint
app.get("/mine-block", (req, res) => {
    let prev_block = blockchain.getPreviousBlock()
    let previous_proof = prev_block.proof

    let proof = blockchain.proofOfWork(previous_proof)
    const block = blockchain.createBlock(proof, blockchain.hashPreviousBlock())


    return res.status(200).json({
        ...block,
        message: "Block has been mined successfully"
    })
})

// Get blockchain endpoint
app.get("/get-chain", (req, res) => {
    res.json({
        chain: blockchain.chain,
        length: blockchain.chain.length
    })
})

// Verify if valid chain endpoint
app.get("/is-valid-chain", (req, res) => {
    res.json({
        length: blockchain.chain.length,
        last_block: blockchain.getPreviousBlock(),
        is_valid_chain: blockchain.isValidChain(blockchain.chain)
    })
})

// Start Express app
app.listen(8000, (req, res) => {
    console.log("Listening on port 8000")
})
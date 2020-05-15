const config = require("../config/auth.config")
const Orgs = require('../models/orgs')
const Users = require('../models/users')

const jwt = require('jsonwebtoken')
const N_ROWS_PER_PAGE = 15

exports.get_users = function(req, res){
    Orgs.findById(req.query.orgId, (err, org)=>{
        if(err)
            res.status(500).send("error")


        const dec = jwt.verify(req.headers['x-access-token'], config.secret)

        const signedInUser = org.users.filter(user => user._id == dec.id)[0]

        if(signedInUser !== undefined && signedInUser !== null && signedInUser.admin === true){
            const page = req.query.page

            if(page === undefined || page === null || page === '')
                return res.status(200).send({
                    usersData: org.users
                })
            else{
                const nTablesPages = Math.ceil(org.users.length/N_ROWS_PER_PAGE)
                let users = org.users
                users = users.splice((page*N_ROWS_PER_PAGE)-N_ROWS_PER_PAGE, N_ROWS_PER_PAGE)

                return res.status(200).send({
                    usersData: users,
                    nPages: nTablesPages
                })
            }
        }else
            res.status(401).send("unauthorized")

    })
}

exports.get_user_data = function(req, res){
    Orgs.findById(req.query.orgId, (err, org)=>{
        if(err)
            return res.status(500).send("error")

        const dec = jwt.verify(req.headers['x-access-token'], config.secret)

        const signedInUser = org.users.filter(user => user._id == dec.id)[0]

        if(signedInUser !== undefined && signedInUser !== null && signedInUser.admin === true){
            const user = org.users.filter(user => user._id == req.query.userId)[0]

            return res.status(200).send({
                userData: user
            })
        }else
            return res.status(401).send("unauthorized")

    })
}

exports.update_user = function(req, res){
    Orgs.findById(req.body.orgId, async (err, org) => {
        if(err)
            return res.status(500).send("error")

        const dec = jwt.verify(req.headers['x-access-token'], config.secret)

        const signedInUser = org.users.filter(user => user._id == dec.id)[0]

        if(signedInUser !== undefined && signedInUser !== null && signedInUser.admin === true){
            
            const userData = JSON.parse(req.body.userData)

            for(let i = 0; i < org.users.length; i++){
                if(org.users[i]._id == userData._id){
                    org.users[i] = userData
                    org.markModified('users')
                    await org.save()

                    return res.status(200).send("success")
                }
            }

        }else
            res.status(401).send("unauthorized")

    })
}
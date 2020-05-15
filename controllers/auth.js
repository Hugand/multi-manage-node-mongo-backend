const config = require("../config/auth.config")
const Orgs = require('../models/orgs')
const Users = require('../models/users')

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

exports.check_nameid_email_unique = function(req, res){
    Orgs.find({name_id: req.query.name_id}, (err, org) => {
        if(err)
            return res.status(500).send("error")

        Orgs.find({email: req.query.email}, (err2, org2) => {
            if(err2)
                return res.status(500).send("error")
            
            return res.status(200).send({
                name_id: org.length === 0,
                email: org2.length === 0,
            })
        })
    })
}

exports.register_org = function(req, res){
    const {body} = req
    let newOrg = new Orgs({
        name: body.name,
        email: body.orgEmail,
        name_id: body.name_id,
        password: bcrypt.hashSync(body.orgPassword, 8),
        tables: [
        ],
        users: [
            new Users({
                admin: true,
                email: body.email,
                jobRole: body.jobRole,
                name: body.fullName,
                phone: body.phone,
                username: body.username,
                password: bcrypt.hashSync(body.userPassword, 8),
            })
        ]
    })

    newOrg.save((err) => {
        if(err){
            console.log(err)
            res.status(500).send('err')
        }else
            res.status(200).send("success")
    })
}

exports.register_user = function(req, res){
    const {body} = req

    Orgs.findById(body.orgId, async (err, org) => {
        if(err)
            return res.status(500).send("error")

        const newUser = new Users({
            name: body.fullName,
            username: body.username,
            email: body.email,
            password: bcrypt.hashSync(body.password, 8),
            phone: body.phone,
            jobRole: body.jobRole,
            admin: body.isAdmin
        })

        org.users.push(newUser)
        org.markModified('users')
        await org.save()

        res.status(200).send("success")
    })
}

exports.org_signin = function(req, res){
    Orgs.findOne({name_id: req.body.name_id}, (err, org) => {
        if(err)
            return res.status(500).send({
                status: "failed",
            })
        if(org !== null){
            const isPasswordValid = bcrypt.compareSync(
                req.body.password,
                org.password
            )

            if(isPasswordValid)
                return res.status(200).send({
                    status: "success",
                    cred: org._id
                })
            
        }
        return res.status(500).send({
            status: "failed",
        })
    })
}

exports.user_signin = function(req, res){
    Orgs.findById(req.body.orgId, async (err, org) => {
        if(err)
            return res.status(500).send({
                status: "failed",
            })
        
        if(org !== null){
            let userSigningIn = org.users.filter(user =>
		    (user.name === req.body.userEmail || user.email === req.body.userEmail))[0]
	
	    if(userSigningIn === undefined)
		return res.status(500).send({
			status: "failed",
		})

            const isPasswordValid = bcrypt.compareSync(
                req.body.userPassword,
                userSigningIn.password
            )

            if(isPasswordValid){
                let token = jwt.sign({id: userSigningIn._id}, config.secret, {
                    expiresIn: 86400
                })

                return res.status(200).send({
                    status: "success",
                    userData: userSigningIn,
                    userIdToken: token,
                    orgIdToken: org._id
                })
            }else
                return res.status(500).send({
                    status: "failed",
                })
            
        }else
            res.status(500).send({
                status: "failed1",
            })
    })
}

exports.get_logged_in_user_data = function(req, res){
    Orgs.findById(req.query.orgId, async (err, org) => {
        if(err || org === null)
            return res.status(500).send({
                status: "failed",
            })
        
        if(org !== null){
            let dec = jwt.verify(req.headers['x-access-token'], config.secret)

            let userSigningIn = org.users.filter(user =>
                 (user._id == dec.id))[0]

            return res.status(200).send(userSigningIn)
        }
    })
}

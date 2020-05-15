const express = require('express')
const router = express.Router()
const orgs = require('../controllers/orgs')
const users = require('../controllers/users')
const auth = require('../controllers/auth')
const { authJwt } = require("../middleware");

module.exports = function(app, urlPrefix){
    app.use((req, res, next) => {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        // res.type('application/json')
        next();
    })

    app.get(urlPrefix+'/test', (req, res) => orgs.test(req, res))
    app.get(urlPrefix+'/get', [authJwt.verifyToken],
        (req, res) => orgs.get(req, res))
    
    app.get(urlPrefix+'/getNavbarTablesData', [authJwt.verifyToken], (req, res) => orgs.getNavbarTablesData(req, res))
    app.get(urlPrefix+'/get_table_data', [authJwt.verifyToken], (req, res) => orgs.get_table_data(req, res))
    app.get(urlPrefix+'/get_table_row_data', [authJwt.verifyToken], (req, res) => orgs.get_table_row_data(req, res))
    app.post(urlPrefix+'/create_table', [authJwt.verifyToken], (req, res) => orgs.create_table(req, res))
    app.post(urlPrefix+'/add_table_row', [authJwt.verifyToken], (req, res) => orgs.add_table_row(req, res))
    app.post(urlPrefix+'/update_table_row', [authJwt.verifyToken], (req, res) => orgs.update_table_row(req, res))
    app.post(urlPrefix+'/update_table_fields', [authJwt.verifyToken], (req, res) => orgs.update_table_fields(req, res))
    app.post(urlPrefix+'/add_table_field', [authJwt.verifyToken], (req, res) => orgs.add_table_field(req, res))
    app.post(urlPrefix+'/delete_table_field', [authJwt.verifyToken], (req, res) => orgs.delete_table_field(req, res))
    app.post(urlPrefix+'/delete_table', [authJwt.verifyToken], (req, res) => orgs.delete_table(req, res))
    
    app.get(urlPrefix+'/check_nameid_email_unique', (req, res) => auth.check_nameid_email_unique(req, res))
    app.post(urlPrefix+'/org_signin', (req, res) => auth.org_signin(req, res))
    app.post(urlPrefix+'/user_signin', (req, res) => auth.user_signin(req, res))
    app.post(urlPrefix+'/register_org', (req, res) => auth.register_org(req, res))
    app.post(urlPrefix+'/register_user', [authJwt.verifyToken], (req, res) => auth.register_user(req, res))
    app.get(urlPrefix+'/get_logged_in_user_data', [authJwt.verifyToken], (req, res) => auth.get_logged_in_user_data(req, res))

    app.get(urlPrefix+'/get_users', [authJwt.verifyToken], (req, res) => users.get_users(req, res))
    app.get(urlPrefix+'/get_user_data', [authJwt.verifyToken], (req, res) => users.get_user_data(req, res))
    app.post(urlPrefix+'/update_user', [authJwt.verifyToken], (req, res) => users.update_user(req, res))
}

// module.exports = router
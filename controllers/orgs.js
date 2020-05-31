const path = require('path')
const Orgs = require('../models/orgs')
const Users = require('../models/users')
const Tables = require('../models/tables')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require("../config/auth.config")

const N_ROWS_PER_PAGE = 15

exports.getNavbarTablesData = function(req, res){
    Orgs.findById(req.query.orgId, (err, org) => {
        if(err)
            res.status(500).send("Error")

        let tables = org.tables

        let tablesData = []

        for(table in tables){
            tablesData.push({
                tableId: tables[table]._id,
                tableName: tables[table].name
            })
        }

        res.status(200).send(tablesData.sort((table1, table2) => (table1.tableId > table2.tableId) ? 1 : -1))
        
    })
}

exports.get_table_data = function(req, res){
    Orgs.findById(req.query.orgId, (err, org) => {
        const tableId = req.query.tableId
        if(err || tableId == "undefined")
            return res.status(500).send("Error")
        let tableData = org.tables.filter((e) => e._id == tableId)[0]
        console.log(tableData)
        if(req.query.page === undefined || req.query.page === null || req.query.page === '' || tableData.data.length === 0)
            return res.status(200).send({
                tableData: tableData
            })
        else{ 
            const nTablePages = Math.ceil(tableData.data.length/N_ROWS_PER_PAGE)
            tableData.data = tableData.data.splice((req.query.page*N_ROWS_PER_PAGE)-N_ROWS_PER_PAGE, N_ROWS_PER_PAGE)
            return res.status(200).send({
                tableData: tableData,
                nPages: nTablePages
            })
        }
    })
}

exports.get_table_row_data = function(req, res){
    Orgs.findById(req.query.orgId, (err, org) => {
        if(err)
            res.status(500).send("Error")
        const tableId = req.query.tableId
        const rowIndex = req.query.rowIndex
        console.log(org.tables)
        let tableData = org.tables.filter((e) =>{ 
            return e._id == tableId
        })[0]
        let data = tableData.data[rowIndex]

        if(data === undefined){
            return res.status(200).send({
                fieldsData: tableData.fields,
                data: []
            })
        }

        data["tableName"] = tableData.name

        let response = {
            fieldsData: tableData.fields,
            data: data
        }

        return res.status(200).send(response)
    })
}

exports.create_table = function(req, res){

    Orgs.findById(req.body.orgId, async (err, org) => {
        if(err)
            res.status(500).send("Error")

        // Test this :)
        
        const data = JSON.parse(req.body.tableData)
        let newTable = new Tables({
            data: [],
            fields: data.fields.map(field => {
                return {
                    name: field.fieldName,
                    type: field.fieldType,
                    select_data: field.selectValues,
                    display_table: field.displayInTable,
                }
            }),
            name: data.name,
        })

        org.tables.push(newTable)

        await org.save()

        res.status(200).send({status: "sucess"})
    })
}

exports.add_table_row = function(req, res){
    const org_id = req.body.orgId
    const tableData = JSON.parse(req.body.tableData)
    const table_id = req.body.tableId

    Orgs.findById(org_id, async (err, org)  => {
        if(err)
            res.status(500).send("Error")
        
        for(let i = 0; i < org.tables.length; i++){
            const table = org.tables[i]
            if(table._id == table_id){
                org.tables[i].data.push(tableData)
                org.markModified('tables')
                await org.save()
                break
            }
        }

        return res.status(200).send("success")
    })
}

exports.update_table_row = function(req, res){
    const org_id = req.body.orgId
    const row_data = JSON.parse(req.body.rowData)
    const table_id = req.body.tableId
    const row_index = req.body.rowIndex
    const row_data_parsed = {}

    row_data.forEach(field => {
        row_data_parsed[field.fieldName] = field.fieldValue
    })
    Orgs.findById(org_id, async (err, org) => {
        if(err)
            res.status(500).send("Error")
        
        for(let i = 0; i < org.tables.length; i++){
            const table = org.tables[i]
            if(table._id == table_id){
                org.tables[i].data[row_index] = row_data_parsed
                org.markModified('tables')
                await org.save()
                break
            }
        }
            
        res.status(200).send("sucess")
    })
}

exports.update_table_fields = function(req, res){
    const org_id = req.body.orgId
    const fieldsData = JSON.parse(req.body.fieldsData)
    const table_id = req.body.tableId

    Orgs.findById(org_id, async (err, org) => {
        if(err)
            res.status(500).send("Error")
        
        for(let i = 0; i < org.tables.length; i++){
            const table = org.tables[i]
            if(table._id == table_id){

                const dec = jwt.verify(req.headers['x-access-token'], config.secret)

                const signedInUser = org.users.filter(user => user._id == dec.id)[0]
                
                if(signedInUser !== undefined && signedInUser !== null && signedInUser.admin === true){
                    let reqFieldData
                    org.tables[i].fields.forEach((field) => {
                        reqFieldData = fieldsData.filter(f => {
                            return f.name == field.name
                        })[0]
                        field.select_data = reqFieldData.select_data
                        field.display_table = reqFieldData.display_table
                        field.type =  reqFieldData.type
                    })
                    org.markModified('tables')
                    await org.save()
                    return res.status(200).send("success")
                }else
                    res.status(403).send("unauthorized")

                break
            }
        }

    })
}

exports.add_table_field = function(req, res){
    const org_id = req.body.orgId
    const table_id = req.body.tableId

    Orgs.findById(org_id, async (err, org) => {
        if(err)
            res.status(500).send("Error")

        const newField = {
            name: req.body.fieldName,
            type: req.body.fieldType,
            select_data: req.body.selectData,
            display_table: req.body.displayTable
        }
        
        for(let i = 0; i < org.tables.length; i++){
            const table = org.tables[i]
            if(table._id == table_id){

                const dec = jwt.verify(req.headers['x-access-token'], config.secret)

                const signedInUser = org.users.filter(user => user._id == dec.id)[0]
                
                if(signedInUser !== undefined && signedInUser !== null && signedInUser.admin === true){
                    org.tables[i].fields.push(newField)
                    org.tables[i].data.forEach(row => {
                        if(newField.type !== 'select')
                            row[newField.name] = ""
                        else
                            row[newField.name] = newField.select_data[0]
                    })
                    console.log(org.tables[i])
                    org.markModified('tables')
                    await org.save()
                    return res.status(200).send("success")
                }else{
                    return res.status(403).send("unauthorized")
                }
                break
            }
        }


    })
}

exports.delete_table_field = function(req, res){
    const org_id = req.body.orgId
    const table_id = req.body.tableId
    const fieldIndex = req.body.fieldIndex

    Orgs.findById(org_id, async (err, org) => {
        if(err)
            res.status(500).send("Error")
        
        for(let i = 0; i < org.tables.length; i++){
            const table = org.tables[i]
            if(table._id == table_id){

                const dec = jwt.verify(req.headers['x-access-token'], config.secret)

                const signedInUser = org.users.filter(user => user._id == dec.id)[0]
                
                if(signedInUser !== undefined && signedInUser !== null && signedInUser.admin === true){
                    const fieldName = org.tables[i].fields[fieldIndex].name
    
                    org.tables[i].fields.splice(fieldIndex, 1)
                    org.tables[i].data.forEach(row => {
                        delete row[fieldName]
                    })
                    console.log(org.tables[i])
                    org.markModified('tables')
                    await org.save()
                    return res.status(200).send("success")
                }else{
                    return res.status(403).send("unauthorized")
                }

                break
            }
        }

    })
}


exports.delete_table = function(req, res){
    const org_id = req.body.orgId
    const table_id = req.body.tableId
    const adminPass = req.body.adminPass

    Orgs.findById(org_id, async (err, org) => {
        if(err)
            res.status(500).send("Error")
        
        for(let i = 0; i < org.tables.length; i++){
            const table = org.tables[i]
            if(table._id == table_id){


                const dec = jwt.verify(req.headers['x-access-token'], config.secret)

                const signedInUser = org.users.filter(user => user._id == dec.id)[0]
                const isPasswordValid = bcrypt.compareSync(
                    adminPass,
                    signedInUser.password
                )

                if(signedInUser !== undefined && signedInUser !== null && signedInUser.admin === true && isPasswordValid == true){
                    org.tables.splice(i, 1)
                    org.markModified('tables')
                    await org.save()
                    return res.status(200).send("success")
                }else{
                    return res.status(401).send({
                        message: 'wrong_password'
                    })
                }
                break
            }
        }


    })
}
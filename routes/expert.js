const express = require('express');
const router = express.Router();

//import express validator
const { body, validationResult } = require('express-validator');

//import database
const connection = require('../config/database');

/**
 * INDEX fasilitas_expert
 */
router.get('/', function (req, res) {
    //query
    connection.query('SELECT * FROM fasilitas_expert ORDER BY id desc', function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'List Data fasilitass',
                data: rows
            })
        }
    });
});

/**
 * STORE fasilitas_expert
 */
 router.post('/store', [

    //validation
    body('nama').notEmpty(),
    body('alamat').notEmpty(),
    body('deskripsi').notEmpty(),
    body('link').notEmpty(),

], (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    //define formData
    let formData = {
        nama: req.body.nama,
        alamat: req.body.alamat,
        deskripsi: req.body.deskripsi,
        link: req.body.link,
    }

    // insert query
    connection.query('INSERT INTO fasilitas_expert SET ?', formData, function (err, rows) {
        //if(err) throw err
        if (err) {  
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            })
        } else {
            return res.status(201).json({
                status: true,
                message: 'Insert Data Successfully',
                data: rows[0]
            })
        }
    })

});

/**
 * SHOW fasilitas_expert
 */
router.get('/(:id)', function (req, res) {

    let id = req.params.id;

    connection.query(`SELECT * FROM fasilitas_expert WHERE id = ${id}`, function (err, rows) {

        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            })
        }

        // if fasilitas_expert not found
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Data fasilitas_expert Not Found!',
            })
        }
        // if fasilitas_expert found
        else {
            return res.status(200).json({
                status: true,
                message: 'Detail Data fasilitas_expert',
                data: rows[0]
            })
        }
    })
})

/**
 * UPDATE fasilitas_expert
 */
router.patch('/update/:id', [

    //validation
    body('nama').notEmpty(),
    body('alamat').notEmpty(),
    body('deskripsi').notEmpty(),
    body('link').notEmpty(),

], (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    //id fasilitas_expert
    let id = req.params.id;

    //data fasilitas_expert
    let formData = {
        nama: req.body.nama,
        alamat: req.body.alamat,
        deskripsi: req.body.deskripsi,
        link: req.body.link,
    }

    // update query
    connection.query(`UPDATE fasilitas_expert SET ? WHERE id = ${id}`, formData, function (err, rows) {
        //if(err) throw err
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Update Data Successfully!'
            })
        }
    })

});

/**
 * DELETE fasilitas_expert
 */
router.delete('/delete/(:id)', function(req, res) {

    let id = req.params.id;
     
    connection.query(`DELETE FROM fasilitas_expert WHERE id = ${id}`, function(err, rows) {
        //if(err) throw err
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Delete Data Successfully!',
            })
        }
    })
});
module.exports = router;
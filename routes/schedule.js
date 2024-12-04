const express = require('express');
const router = express.Router();

//import express validator
const { body, validationResult } = require('express-validator');

//import database
const connection = require('../config/database');

/**
 * INDEX kegiatan_tanggal
 */
router.get('/', function (req, res) {
    //query
    connection.query('SELECT * FROM kegiatan_tanggal ORDER BY id desc', function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'List Data aktivitass',
                data: rows
            })
        }
    });
});

/**
 * STORE kegiatan_tanggal
 */
 router.post('/store', [

    //validation
    body('fk_user').notEmpty(),
    body('nama').notEmpty(),
    body('tanggal').notEmpty(),

], (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    //define formData
    let formData = {
        fk_user: req.body.fk_user,
        nama: req.body.nama,
        tanggal: req.body.tanggal,
    }

    // insert query
    connection.query('INSERT INTO kegiatan_tanggal SET ?', formData, function (err, rows) {
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
 * SHOW kegiatan_tanggal
 */
router.get('/(:id)', function (req, res) {

    let id = req.params.id;

    connection.query(`SELECT * FROM kegiatan_tanggal WHERE fk_user = ${id} ORDER BY id desc`, function (err, rows) {

        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            })
        }

        // if kegiatan_tanggal not found
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Data kegiatan_tanggal Not Found!',
            })
        }
        // if kegiatan_tanggal found
        else {
            return res.status(200).json({
                status: true,
                message: 'Detail Data kegiatan_tanggal',
                data: rows
            })
        }
    })
})

/**
 * UPDATE kegiatan_tanggal
 */
router.patch('/update/:id', [

    //validation
    body('fk_user').notEmpty(),
    body('nama').notEmpty(),
    body('tanggal').notEmpty(),

], (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    //id kegiatan_tanggal
    let id = req.params.id;

    //data kegiatan_tanggal
    let formData = {
        fk_user: req.body.fk_user,
        nama: req.body.nama,
        tanggal: req.body.tanggal,
    }

    // update query
    connection.query(`UPDATE kegiatan_tanggal SET ? WHERE id = ${id}`, formData, function (err, rows) {
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
 * DELETE kegiatan_tanggal
 */
router.delete('/delete/(:id)', function(req, res) {

    let id = req.params.id;
     
    connection.query(`DELETE FROM kegiatan_tanggal WHERE id = ${id}`, function(err, rows) {
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
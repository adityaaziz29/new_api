const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const connection = require('../config/database');

/**
 * INDEX *
**/
router.get('/', function (req, res) {
    // Get the page, limit, and search query from the query parameters
    const page = parseInt(req.query.page) || 1; // Default to the first page
    const limit = parseInt(req.query.limit) || 5; // Default to 5 tutorials per page
    const offset = (page - 1) * limit; // Calculate the offset
    const search = req.query.search ? `%${req.query.search}%` : null;

    // Base query for selecting tutorials
    let query = 'SELECT * FROM tutorial';
    let queryParams = [];

    // Add search condition if search query exists
    if (search) {
        query += ' WHERE judul LIKE ? OR deskripsi LIKE ?';
        queryParams.push(search, search);
    }

    // Add ordering, limit, and offset for pagination
    query += ' ORDER BY id ASC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    // Execute the query with pagination
    connection.query(query, queryParams, function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            });
        }

        // Query to get the total number of tutorials for pagination
        let countQuery = 'SELECT COUNT(*) AS total FROM tutorial';
        let countParams = [];

        // Add search condition to the count query if search query exists
        if (search) {
            countQuery += ' WHERE judul LIKE ? OR deskripsi LIKE ?';
            countParams.push(search, search);
        }

        connection.query(countQuery, countParams, function (countErr, countRows) {
            if (countErr) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                });
            }

            const totalTutorials = countRows[0].total;
            const totalPages = Math.ceil(totalTutorials / limit);

            return res.status(200).json({
                status: true,
                message: 'List Data tutorials',
                data: rows,
                pagination: {
                    totalTutorials: totalTutorials,
                    totalPages: totalPages,
                    currentPage: page,
                    limit: limit,
                }
            });
        });
    });
});

// Konfigurasi penyimpanan multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/tutorial'); // Tempat penyimpanan file
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nama file dengan timestamp
    }
});

// Filter untuk menerima hanya file gambar
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
    }
};

// Inisialisasi multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Batas ukuran file 5MB
    fileFilter: fileFilter
});
/**
 * STORE TUTORIAL
 */
router.post('/store', upload.single('foto'), [

    // Validasi input
    body('judul').notEmpty(),
    body('deskripsi').notEmpty(),
    body('link').notEmpty(),
], (req, res) => {

    // Cek validasi
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    // Cek apakah ada file yang di-upload
    if (!req.file) {
        return res.status(422).json({
            status: false,
            message: 'Foto harus di-upload!'
        });
    }

    // Definisikan data form
    let formData = {
        judul: req.body.judul,
        deskripsi: req.body.deskripsi,
        link: req.body.link,
        foto: req.file.filename, // Simpan nama file hasil upload
    }

    // Query untuk menyimpan data
    connection.query('INSERT INTO tutorial SET ?', formData, function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            });
        } else {
            return res.status(201).json({
                status: true,
                message: 'Insert Data Successfully',
                data: rows[0]
            });
        }
    });

});


/**
 * SHOW TUTORIAL
 */
router.get('/(:id)', function (req, res) {

    let id = req.params.id;

    connection.query(`SELECT * FROM tutorial WHERE id = ${id}`, function (err, rows) {

        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            })
        }

        // if tutorial not found
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Data Tutorial Not Found!',
            })
        }
        // if tutorial found
        else {
            return res.status(200).json({
                status: true,
                message: 'Detail Data Tutorial',
                data: rows[0]
            })
        }
    })
})

/**
 * UPDATE Tutorial
 */
router.patch('/update/:id', [

    //validation
    body('judul').notEmpty(),
    body('deskripsi').notEmpty(),
    body('link').notEmpty(),
    body('foto').notEmpty(),

], (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({
            errors: errors.array()
        });
    }

    //id tutorial
    let id = req.params.id;

    //data tutorial
    let formData = {
        judul: req.body.judul,
        deskripsi: req.body.deskripsi,
        link: req.body.link,
        foto: req.body.foto,
    }

    // update query
    connection.query(`UPDATE tutorial SET ? WHERE id = ${id}`, formData, function (err, rows) {
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
 * DELETE TUTORIAL
 */
router.delete('/delete/(:id)', function(req, res) {

    let id = req.params.id;
     
    connection.query(`DELETE FROM tutorial WHERE id = ${id}`, function(err, rows) {
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

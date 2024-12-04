const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const connection = require('../config/database');

/**
 * INDEX article with pagination
 */
router.get('/', function (req, res) {
    // Get the page, limit, and search query from the query parameters
    const page = parseInt(req.query.page) || 1; // Default to the first page
    const limit = parseInt(req.query.limit) || 5; // Default to 5 articles per page
    const offset = (page - 1) * limit; // Calculate the offset
    const search = req.query.search ? `%${req.query.search}%` : null;

    // Base query for selecting articles
    let query = 'SELECT * FROM article';
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

        // Query to get the total number of articles for pagination
        let countQuery = 'SELECT COUNT(*) AS total FROM article';
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

            const totalArticles = countRows[0].total;
            const totalPages = Math.ceil(totalArticles / limit);

            return res.status(200).json({
                status: true,
                message: 'List Data articles',
                data: rows,
                pagination: {
                    totalArticles: totalArticles,
                    totalPages: totalPages,
                    currentPage: page,
                    limit: limit,
                }
            });
        });
    });
});


// Konfigurasi multer untuk menyimpan file gambar
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/article'); // folder tempat penyimpanan file gambar
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // menambahkan timestamp pada nama file
    }
});

// Inisialisasi multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // batas ukuran file 5MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Hanya gambar dengan format .jpeg, .jpg, dan .png yang diperbolehkan!'));
        }
    }
});

/**
 * STORE article
 */
router.post('/store', upload.single('foto'), [
    //validation
    body('judul').notEmpty(),
    body('deskripsi').notEmpty(),
    body('link').notEmpty()
], (req, res) => {
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

    //define formData
    let formData = {
        judul: req.body.judul,
        deskripsi: req.body.deskripsi,
        link: req.body.link,
        foto: req.file.filename // menyimpan nama file gambar
    }

    // insert query
    connection.query('INSERT INTO article SET ?', formData, function (err, rows) {
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
 * SHOW article
 */
router.get('/(:id)', function (req, res) {
    let id = req.params.id;
    connection.query(`SELECT * FROM article WHERE id = ${id}`, function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            })
        }
        // if article not found
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Data article Not Found!',
            })
        } else { // if article found
            return res.status(200).json({
                status: true,
                message: 'Detail Data article',
                data: rows[0]
            })
        }
    })
});

/**
 * UPDATE article
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

    //id article
    let id = req.params.id;

    //data article
    let formData = {
        judul: req.body.judul,
        deskripsi: req.body.deskripsi,
        link: req.body.link,
        foto: req.body.foto,
    }

    // update query
    connection.query(`UPDATE article SET ? WHERE id = ${id}`, formData, function (err, rows) {
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
    });
});

/**
 * DELETE article
 */
router.delete('/delete/(:id)', function(req, res) {
    let id = req.params.id;
    connection.query(`DELETE FROM article WHERE id = ${id}`, function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Internal Server Error',
            });
        } else {
            return res.status(200).json({
                status: true,
                message: 'Delete Data Successfully!',
            });
        }
    });
});

module.exports = router;

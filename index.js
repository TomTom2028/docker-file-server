import express from 'express'

const app = express()
import mutler from 'multer'
import mime from 'mime-types'
import {randomBytes} from 'crypto'
import fs from 'fs/promises'
import {dirname, basename} from 'path'

import {fileTypeFromFile} from 'file-type'


const whitelist = process.env.whitelist?.split(' ') || [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp'
]



const storage = mutler.diskStorage({
    destination: function (req, file, cb){
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        const extension = mime.extension(file.mimetype);
        cb(null, `${randomBytes(32).toString("hex")}.${extension}`);
    }
})

app.use('/uploads', express.static('uploads'))


const upload = mutler({ storage: storage, fileFilter: function (req, file, cb) {
        if (!whitelist.includes(file.mimetype)) {
            return cb(new Error('file is not allowed'))
        }

        cb(null, true)
    }});



app.post('/file', upload.single('file'), async (req, res, next) => {
    try {
        const meta = await fileTypeFromFile(req.file.path)

        if (!whitelist.includes(meta.mime)) {
            await fs.rm(req.file.path)
            return next(new Error('file is not allowed'))
        }
        res.json(req.file);
    } catch (e) {
        next(e);
    }
})

app.delete('/file', async (req, res, next) => {
    try {
        const path = req.query.path;
        if (!path) {
            res.sendStatus(404);
            return;
        }

        if (dirname(path) !== 'uploads') {
            res.sendStatus(404);
            return;
        }


        const files = await fs.readdir('uploads')

        if (!files.includes(basename(path))) {
            res.sendStatus(404);
            return;
        }


        await fs.unlink(path);
        res.sendStatus(204);

    } catch (e) {
        console.error(e);
        next(e);
    }


})



app.listen(3000, () => {
    console.log("ready")
})
function errorHandler (err, req, res, next) {
    console.error(err.stack)
    res.sendStatus(500)
}

app.use(errorHandler);

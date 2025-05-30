const express = require('express');
const router = express.Router();
const codigos = require('../model/codigos');

router.get('/', async function(req, res) {
    let filters = {};
    if(req.query.nc) {
        filters['type'] = req.query.nc;
    }
    let data = await codigos.consultar({where: filters});
    res.send(data);
});

router.get('/:id', async function(req, res) {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) {
        return res.status(400).send('ID inválido, debe ser un número.');
    }

    let data = await codigos.consultarPorId(id);
    if (data.length == 0) {
        res.status(404).send('Código no encontrado.');
    } else 
    {
        res.send(data[0]);
    }
});

router.post('/', async function(req, res) {
    if(!req.body){
        res.status(400).send({error:'Bad request'});
        return;
    }

    codigos.insertar(req.body)
     .then(function(ret){
        let id = ret[0];
        res.setHeader('Location', `${req.protocol}://${req.get('host')}/codigos/${id}`);
        res.status(201).send({id: id});
     })
     .catch(function(err){
        console.log(err);
        res.status(500).send(err);
     });
});

router.put('/:id', async function(req, res) {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) {
        return res.status(400).send('ID inválido, debe ser un número.');
    } else {
        if(!req.body){
            res.status(400).send({error:'Bad request'});
            return;
        }
        let data = await codigos.actualizarPorId(id, req.body);
        if (data.length == 0) {
            res.status(404).send('Código no encontrado.');
        } else 
        {
            res.send(data[0]);
        }
    }
});
    

router.delete('/:id', async function(req, res) {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) {
        return res.status(400).send('ID inválido, debe ser un número.');
    } else {
        let data = await codigos.eliminarPorId(id);
        if (data.length == 0) {
            res.status(404).send('Código no encontrado.');
        } else 
        {
            res.send(data[0]);
        }
    }
});

module.exports = router;
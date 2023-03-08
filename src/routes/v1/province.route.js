const express = require('express');
const provinceController = require('../../controllers/province.controller');

const router = express.Router();

router.route('/').get(provinceController.getProvinces);

router.route('/:provinceId/cities').get(provinceController.getCitiesByProvinceId);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Provinces
 *   description: Provinces management and retrieval
 */

/**
 * @swagger
 * /provinces:
 *   get:
 *     summary: Get all provinces
 *     description: Anyone can retrieve all provinces.
 *     tags: [Provinces]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items:
 *                $ref: '#/components/schemas/Province'
 */

/**
 * @swagger
 * /provinces/{provinceId}/cities:
 *   get:
 *     summary: Get all cities by province id
 *     description: Anyone can retrieve all cities by province id.
 *     tags: [Provinces]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items:
 *                $ref: '#/components/schemas/City'
 */

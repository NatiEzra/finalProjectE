import express  from 'express';
const router = express.Router();
import postController from '../controller/postController';
import {authMiddleware} from '../controller/authController';
import swaggerJSDoc from 'swagger-jsdoc';
import multer from 'multer';
import path from 'path';

// Set storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images"); // Save images inside 'images' folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
  });

// Multer upload middleware
const upload = multer({ storage: storage });




/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - SenderId
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         SenderId:
 *           type: string
 *           description: The sender id of the post
 *       example:
 *         title: Test Post
 *         content: Test Content
 *         SenderId: TestSenderId
 */


/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: The post was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */

router.post('/', authMiddleware, upload.single("image"), postController.createPost.bind(postController));
//router.post('/', authMiddleware ,postController.createPost);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Returns the list of all the posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: The list of the posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Server error
 */
router.get('/', postController.getAllPosts);

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get the post by id
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: The post description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: The post was not found
 *       500:
 *         description: Server error
 */
router.get('/:id', postController.getPostById);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update an existing post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: The post was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.put('/:id',authMiddleware,upload.single("image"), postController.updatePost);


/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The post was successfully deleted
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.delete('/:id',authMiddleware, postController.deletePost);
//add like to post

/**
 * @swagger
 * /posts/like/{id}:
 *   post:
 *     summary: Add like to post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The post was successfully liked
 *       400:
 *         description: Post not found
 */
router.post('/like/:id',authMiddleware, postController.likePost);
//remove like from post

/**
 * @swagger
 * /posts/unlike/{id}:
 *   post:
 *     summary: Remove like from post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The like was successfully removed from the post
 *       400:
 *         description: Post not found
 */
router.post('/unlike/:id',authMiddleware, postController.unlikePost);

export default router;

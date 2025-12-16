import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getVideoComments, addComment, deleteComment, updateComment } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT); // Apply middleware to all the routes

router.route("/:videoId").get().post();
router.route("/comment/:commentId").delete().patch();

export default router;
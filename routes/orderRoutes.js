const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// Create order
router.post("/", authMiddleware, orderController.createOrder);

// User orders
router.get("/my", authMiddleware, orderController.getMyOrders);

// Admin: all orders
router.get("/", authMiddleware, roleMiddleware("admin"), orderController.getOrders);

// Admin: resolve order
router.patch(
  "/:id/resolve",
  authMiddleware,
  roleMiddleware("admin"),
  orderController.resolveOrder
);

// Admin: delete order
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  orderController.deleteOrder
);

router.get("/has-bought/:productId", authMiddleware, async (req, res) => {
  const order = await Order.findOne({
    user: req.user._id,
    paymentStatus: "completed",
    "products.product": req.params.productId,
  });

  res.json({ hasBought: !!order });
});


module.exports = router;

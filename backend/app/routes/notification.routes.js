const express = require("express");
const { getAllNotif, getNoReadNotif, getNotifWithType, markReadNotif , deleteNotification, notifyRoleChange, notifyRoleChangeToManagers} = require("../controllers/notification.controllers");

const router = express.Router();

router.post("/notifications/noread", getNoReadNotif);
router.post("/notifications/withtype", getNotifWithType);
router.post("/notifications", getAllNotif);
router.put("/notifications/markread", markReadNotif);
router.delete("/notifications", deleteNotification);
router.post("/notifications/rolechange", notifyRoleChange);
router.post("/notifications/rolechange/managers", notifyRoleChangeToManagers);

module.exports = router;
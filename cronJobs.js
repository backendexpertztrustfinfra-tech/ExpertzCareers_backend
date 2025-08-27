const cron = require("node-cron");
const Jobs = require("./model/User/jobSchema");

// This will run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();
    const result = await Jobs.updateMany(
      { expiryDate: { $lte: now }, status: { $ne: "close" } },
      { $set: { status: "close" } }
    );

    if (result.modifiedCount > 0) {
    console.log(`${result.modifiedCount} jobs closed because of expiry`);  
    }

   // console.log("Cron running at:", now.toISOString(), "Result:", result);

  } catch (err) {
    console.error("Cron job error:", err);
  }
});

console.log("✅ Cron job scheduler started...");

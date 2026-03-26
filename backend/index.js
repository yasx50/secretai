import "dotenv/config";
import connectDB from "./src/config/Database-config.js";
import app from "./app.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to boot server:", error.message);
    process.exit(1);
  });

require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
    console.log(`🚀 App Name    : ${process.env.APP_NAME}`);
    console.log(`🔌 Server Port : http://localhost:${PORT}`);
});

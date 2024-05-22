const User = require("./models/User");

async function main() {
    try {
        const result = await User.spendCredit("664d576a9b9367ae52e72b5d");

        console.log(result);
    } catch (error) {
        console.log(error);
    }
}

main()
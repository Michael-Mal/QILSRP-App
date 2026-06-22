
const hostname = "db.c94e02i280vd.ap-southeast-2.rds.amazonaws.com"
const user = "admin"

/*
import { Signer } from "@aws-sdk/rds-signer";
import { fromLoginCredentials } from "@aws-sdk/credential-providers";

const signer = new Signer({
  hostname: hostname,
  port: 3306,
  username: user,
  credentials: fromLoginCredentials({profile: "QILSRP"}),
  region: "ap-southeast-2b",
});

const token = await signer.getAuthToken();
*/
export default {
  client: 'mysql2',
  connection: {
    host: hostname,
    user: user,
    password: "euxF3JPkeXIgD0Kk6uSF",
    database: "QILSRP",
    ssl: 'Amazon RDS'
  }
};

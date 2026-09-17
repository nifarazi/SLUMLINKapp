import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const [{ verifyEmailConnection }, { checkSMSBalance }] = await Promise.all([
  import('../backend/utils/email.js'),
  import('../backend/utils/sms.js'),
]);

const redactMessage = (message = '') => String(message)
  .replace(process.env.EMAIL_USER || /$^/, '<email>')
  .replace(process.env.EMAIL_PASSWORD || /$^/, '<email-password>')
  .replace(process.env.BULKSMS_API_KEY || /$^/, '<sms-api-key>');

const email = await verifyEmailConnection();
const sms = await checkSMSBalance();

console.log(`Email SMTP: ${email.ok ? 'PASS' : 'FAIL'} - ${redactMessage(email.message)}`);
console.log(`BulkSMSBD API: ${sms.ok ? 'PASS' : 'FAIL'} - ${redactMessage(sms.message)}`);

if (!email.ok || !sms.ok) {
  process.exitCode = 1;
}
